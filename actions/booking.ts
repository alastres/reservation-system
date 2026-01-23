"use server";

import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/availability-engine";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

import { startOfDay, endOfDay, addMinutes, parse, format } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { sendBookingConfirmation, sendNewBookingNotification, sendRescheduledBookingNotification, sendCancellationNotification } from "@/lib/mail";
import { getBusyTimes, createGoogleEvent } from "@/lib/google-calendar";


export const getSlotsAction = async (dateStr: string, serviceId: string, timeZone: string) => {
    // dateStr is iso date "YYYY-MM-DD"
    const service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: { user: { include: { availabilityRules: true, bookings: true, availabilityExceptions: true } } }
    });

    if (!service) return { error: "Service not found" };

    // Valid TimeZone check
    try {
        Intl.DateTimeFormat(undefined, { timeZone });
    } catch (e) {
        return { error: "Invalid TimeZone" };
    }

    // 1. Determine "Day" in Target TimeZone
    // dateStr is "2024-XX-XX". We want 00:00:00 in `timeZone`.
    // fromZonedTime takes "YYYY-MM-DD HH:mm:ss" effectively if passed strings, 
    // but easier to make a string and parse it as if it's in that zone.
    const startOfDayInZone = fromZonedTime(`${dateStr} 00:00:00`, timeZone);
    const endOfDayInZone = fromZonedTime(`${dateStr} 23:59:59.999`, timeZone);

    // DB Queries should check against these UTC equivalents
    const dayStart = startOfDayInZone;
    const dayEnd = endOfDayInZone;

    // Fetch bookings that overlap with this target day
    const bookings = await prisma.booking.findMany({
        where: {
            service: { userId: service.userId },
            startTime: { lt: dayEnd },
            endTime: { gt: dayStart },
            status: "CONFIRMED"
        }
    });

    console.log("[getSlotsAction] Debug Info:", {
        serviceId,
        dateStr,
        timeZone,
        dayStart: dayStart.toISOString(),
        dayEnd: dayEnd.toISOString(),
        bookingsFound: bookings.length,
        bookings: bookings.map(b => ({ start: b.startTime, end: b.endTime, status: b.status }))
    });

    // Fetch Google Calendar Busy Times
    const googleBusyTimes = await getBusyTimes(service.userId, dayStart, dayEnd);

    // Filter out Google Busy Times that overlap exactly with existing system bookings
    // This prevents double counting if Google Calendar Sync is enabled.
    // If a Google Event starts/ends at the same time as a Booking, we assume it's the same event.
    const uniqueGoogleBusyTimes = googleBusyTimes.filter(gBusy => {
        const gStart = new Date(gBusy.start!).getTime();
        const gEnd = new Date(gBusy.end!).getTime();

        const isDuplicate = bookings.some(b => {
            const bStart = b.startTime.getTime();
            const bEnd = b.endTime.getTime();
            return Math.abs(gStart - bStart) < 60000 && Math.abs(gEnd - bEnd) < 60000; // 1 minute tolerance
        });

        return !isDuplicate;
    });

    // Merge bookings and busy times
    const allBusySlots = [
        ...bookings,
        ...uniqueGoogleBusyTimes.map(busy => ({
            startTime: new Date(busy.start!),
            endTime: new Date(busy.end!)
        }))
    ];


    const slots = getAvailableSlots(
        startOfDayInZone, // Use the calculate start of day
        service.duration,
        service.user.availabilityRules,
        allBusySlots,
        timeZone,
        service.bufferTime,
        service.user.availabilityExceptions,
        service.minNotice,
        service.user.maxConcurrentClients || 1
    );

    return { slots };
};

export const createBooking = async (
    serviceId: string,
    dateStr: string,
    time: string,
    clientData: { name: string; email: string; clientPhone?: string; notes?: string; answers?: Record<string, string>; recurrence?: string },
    timeZone: string = "UTC",
    clientTimeZone?: string
) => {
    // 1. Verify existence
    const service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: { user: true }
    });
    if (!service) return { error: "Service not found" };

    // 2. Determine Dates to Book
    // Parse the input date/time as being in the specific timeZone
    const initialDate = fromZonedTime(`${dateStr} ${time}:00`, timeZone);

    const datesToBook: Date[] = [initialDate];
    let recurrenceId: string | undefined = undefined;

    if (clientData.recurrence && clientData.recurrence !== "none") {
        recurrenceId = crypto.randomUUID();
        // Generate future dates based on service config
        const count = service.maxRecurrenceCount || 4;
        for (let i = 1; i < count; i++) {
            // Logic for recurrence needs to respect timezone too?
            // Actually, adding "days" or "months" using standard Date methods generally works safely 
            // if we are just shifting by 24h chunks, BUT DST transitions can be tricky.
            // However, for MVP, Date object manipulation (which is UTC based) is usually acceptable for 24h shifts.
            // Better: use date-fns addWeeks/addMonths on the Date object. 
            // Since initialDate is a valid Date object (UTC timestamp), adding 7 days works.

            let nextDate = new Date(initialDate);
            if (clientData.recurrence === "weekly") {
                nextDate.setDate(initialDate.getDate() + (7 * i));
            } else if (clientData.recurrence === "biweekly") {
                nextDate.setDate(initialDate.getDate() + (14 * i));
            } else if (clientData.recurrence === "monthly") {
                nextDate.setMonth(initialDate.getMonth() + i);
            }
            datesToBook.push(nextDate);
        }
    }

    // 2a. Min Notice Check (Only need to check the first/earliest one)
    const minNoticeTime = addMinutes(new Date(), service.minNotice);
    if (datesToBook[0] < minNoticeTime) {
        return { error: `Booking requires at least ${service.minNotice} minutes notice` };
    }

    // 3. Availability Check for ALL dates
    // For group bookings: check if capacity is reached
    for (const date of datesToBook) {
        const checkStart = date;
        const checkEnd = addMinutes(checkStart, service.duration);
        const checkBuffEnd = addMinutes(checkEnd, service.bufferTime || 0);

        // Count existing bookings for this time slot
        const existingCount = await prisma.booking.count({
            where: {
                serviceId: service.id,
                startTime: { lt: checkBuffEnd },
                endTime: { gt: checkStart },
                status: "CONFIRMED"
            }
        });

        const maxGlobal = service.user.maxConcurrentClients || 1;
        const isGroupService = service.capacity > 1;
        const shouldCheckServiceCapacity = isGroupService || maxGlobal === 1;

        if (shouldCheckServiceCapacity && existingCount >= service.capacity) {
            const conflictDate = format(checkStart, "yyyy-MM-dd");
            return { error: `Slot on ${conflictDate} is fully booked (${service.capacity}/${service.capacity} spots taken).` };
        }

        // Global Capacity Check (Staff Scalability)
        const totalConcurrentBookings = await prisma.booking.count({
            where: {
                service: { userId: service.userId },
                startTime: { lt: checkBuffEnd },
                endTime: { gt: checkStart },
                status: "CONFIRMED"
            }
        });

        if (totalConcurrentBookings >= maxGlobal) {
            return { error: `No staff available at this time (Global limit ${maxGlobal} reached).` };
        }
    }

    // 3.5 Find User by Email to link booking
    const existingUser = await prisma.user.findUnique({
        where: { email: clientData.email }
    });

    // 3.6 Update User Name if it differs (and user is a Client/Owner who hasn't set a profile name explicitly? 
    // Actually, for better UX, if I book as "John" but my registered name is "J", updating it seems nice.
    // But we should probably only do this if the existing name is essentially empty or default.
    // Or just always update it as requested by the user: "si el nombre que puso es diferente ... lo actualize"
    if (existingUser && clientData.name && existingUser.name !== clientData.name) {
        await prisma.user.update({
            where: { id: existingUser.id },
            data: { name: clientData.name }
        });
    }

    // 3.7 Handle Payment if Required
    if (service.requiresPayment && service.price > 0) {
        const { createPaymentIntent } = await import("@/lib/stripe");
        const paymentResult = await createPaymentIntent(
            service.price,
            "usd",
            {
                serviceId: service.id,
                serviceName: service.title,
                clientEmail: clientData.email,
                clientName: clientData.name,
                // Add more metadata as needed
                dateStr,
                time,
                timeZone,
                clientPhone: clientData.clientPhone || "",
                clientTimeZone: clientTimeZone || "UTC",
                notes: clientData.notes || "",
                answers: JSON.stringify(clientData.answers || {}),
                recurrence: clientData.recurrence || "none"
            }
        );

        if (paymentResult.error || !paymentResult.paymentIntent) {
            return { error: paymentResult.error || "Payment initialization failed" };
        }

        // Return the client secret so the frontend can show the payment form
        // We do NOT create the booking in the DB yet to avoid cluttering with unpaid sessions
        // unless we use a "PENDING_PAYMENT" status and a cleanup job.
        return {
            requiresPayment: true,
            clientSecret: paymentResult.paymentIntent.client_secret,
            paymentIntentId: paymentResult.paymentIntent.id
        };
    }

    // 4. Create All Bookings (Only if no payment required or payment already handled)
    try {
        await prisma.$transaction(
            datesToBook.map(date => {
                const startTime = date;
                const endTime = addMinutes(startTime, service.duration);

                return prisma.booking.create({
                    data: {
                        serviceId,
                        startTime,
                        endTime,
                        clientName: clientData.name,
                        clientEmail: clientData.email,
                        clientPhone: clientData.clientPhone,
                        notes: clientData.notes,
                        answers: clientData.answers,
                        recurrenceId,
                        clientTimeZone,
                        status: "CONFIRMED",
                        userId: existingUser?.id,
                        paymentStatus: "PENDING",
                        amountPaid: service.price,
                        currency: "usd",
                    }
                });
            })
        );
    } catch (e) {
        console.error("Booking transaction failed", e);
        return { error: "Failed to process booking" };
    }

    // Handle Calendar Sync and Emails using the helper
    await handleBookingFulfillment(
        service,
        datesToBook,
        clientData,
        clientTimeZone,
        initialDate,
        dateStr,
        time
    );

    return { success: recurrenceId ? "Recurring booking confirmed!" : "Booking confirmed!" };
};

export const cancelBooking = async (bookingId: string) => {
    console.log("[CancelBooking] Attempting to cancel booking:", bookingId);
    const session = await auth();

    if (!session?.user?.id) {
        console.log("[CancelBooking] Unauthorized: No session");
        return { error: "Unauthorized" };
    }

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { service: { include: { user: true } } }
    });

    if (!booking) {
        console.log("[CancelBooking] Booking not found");
        return { error: "Booking not found" };
    }

    // Verify ownership
    if (booking.service.userId !== session.user.id) {
        console.log("[CancelBooking] Unauthorized: User is not the owner", {
            ownerId: booking.service.userId,
            currentUserId: session.user.id
        });
        return { error: "Unauthorized" };
    }

    try {
        await prisma.booking.update({
            where: { id: bookingId },
            data: { status: "CANCELLED" }
        });
        console.log("[CancelBooking] Status updated to CANCELLED");
    } catch (e) {
        console.error("[CancelBooking] DB Update Failed", e);
        return { error: "Failed to update booking status" };
    }

    // Send Cancellation Email
    await sendCancellationNotification(
        booking.clientEmail,
        booking.clientName,
        booking.service.title,
        format(booking.startTime, "yyyy-MM-dd"),
        format(booking.startTime, "HH:mm"),
        booking.service.userId // Pass providerId for logging
    );

    revalidatePath("/dashboard/bookings");
    revalidatePath("/dashboard");
    if (booking.service.user?.username && booking.service.url) {
        revalidatePath(`/${booking.service.user.username}/${booking.service.url}`);
    }
    return { success: "Booking cancelled" };
};

export const rescheduleBooking = async (
    bookingId: string,
    newDateStr: string,
    newTime: string
) => {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    // 1. Fetch existing booking
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { service: true }
    });

    if (!booking) return { error: "Booking not found" };

    // 2. Auth Check (Provider Only for now)
    if (booking.service.userId !== session.user.id) {
        return { error: "Unauthorized: You do not manage this booking" };
    }

    const service = booking.service;

    // 3. Calculation & Validation
    const newStartTime = new Date(`${newDateStr}T${newTime}:00`);
    const newEndTime = addMinutes(newStartTime, service.duration);
    const effectiveEndTime = addMinutes(newEndTime, service.bufferTime || 0);

    // Min Notice Check
    const minNoticeTime = addMinutes(new Date(), service.minNotice);
    if (newStartTime < minNoticeTime) {
        return { error: `Rescheduling requires at least ${service.minNotice} minutes notice` };
    }

    // 4. Availability Check (Availability Logic reuse?)
    // Need to ensure we don't collide with OTHER bookings.
    // We EXCLUDE the current booking ID from the check.
    const conflict = await prisma.booking.findFirst({
        where: {
            serviceId: service.id,
            startTime: { lt: effectiveEndTime },
            endTime: { gt: newStartTime },
            status: "CONFIRMED",
            NOT: {
                id: bookingId
            }
        }
    });

    if (conflict) {
        return { error: "The selected slot is already taken" };
    }

    // Capture old details for email
    const oldDateStr = format(booking.startTime, "yyyy-MM-dd");
    const oldTimeStr = format(booking.startTime, "HH:mm");

    // 5. Update Booking
    try {
        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                startTime: newStartTime,
                endTime: newEndTime
            }
        });
    } catch (e) {
        console.error("Reschedule update failed", e);
        return { error: "Failed to update booking" };
    }

    // 6. Notify Client
    await sendRescheduledBookingNotification(
        booking.clientEmail,
        booking.clientName,
        service.title,
        newDateStr,
        newTime,
        service.userId,
        oldDateStr,
        oldTimeStr
    );

    revalidatePath("/dashboard/bookings");
    return { success: "Booking rescheduled successfully" };
};

// Helper to handle calendar sync and email notifications after booking creation
async function handleBookingFulfillment(
    service: any,
    datesToBook: Date[],
    clientData: { name: string; email: string; clientPhone?: string; notes?: string; answers?: any },
    clientTimeZone?: string,
    initialDate?: Date, // The very first date in UTC
    dateStr?: string,   // "YYYY-MM-DD"
    time?: string      // "HH:MM"
) {
    // 1. Sync with Google Calendar
    for (const date of datesToBook) {
        const start = date;
        const end = addMinutes(start, service.duration);

        let description = `Client: ${clientData.name}\nEmail: ${clientData.email}\nNotes: ${clientData.notes || "None"}`;

        if (clientData.clientPhone) {
            description += `\nPhone: ${clientData.clientPhone}`;
        }

        if (clientData.answers) {
            const answers = typeof clientData.answers === 'string' ? JSON.parse(clientData.answers) : clientData.answers;
            description += "\n\nAnswers:\n" + Object.entries(answers).map(([q, a]) => `- ${q}: ${a}`).join("\n");
        }

        // Determine Final Address
        const finalAddress = service.locationType === "IN_PERSON"
            ? (service.address || service.user.address)
            : undefined;

        const eventResult = await createGoogleEvent(service.userId, {
            summary: `Booking: ${service.title} with ${clientData.name}`,
            description,
            start,
            end,
            attendees: [clientData.email],
            location: finalAddress || undefined
        }, {
            withMeet: service.locationType === "GOOGLE_MEET"
        });

        if (eventResult && typeof eventResult === 'object') {
            const createdBooking = await prisma.booking.findFirst({
                where: {
                    serviceId: service.id,
                    startTime: start,
                    status: "CONFIRMED",
                    clientEmail: clientData.email
                }
            });

            if (createdBooking) {
                await prisma.booking.update({
                    where: { id: createdBooking.id },
                    data: {
                        googleEventId: eventResult.id,
                        joinUrl: eventResult.meetLink
                    }
                });
            }
        }
    }

    // 2. Determine Location Details for Email
    let locationDetails = "";
    const finalAddress = service.address || service.user.address;

    switch (service.locationType) {
        case "GOOGLE_MEET":
            locationDetails = "Google Meet (Link in Calendar)";
            break;
        case "PHONE":
            locationDetails = clientData.clientPhone
                ? `Phone Call (Provider will call you at ${clientData.clientPhone})`
                : "Phone Call";
            break;
        case "IN_PERSON":
            locationDetails = finalAddress ? `In Person at ${finalAddress}` : "In Person";
            break;
        case "CUSTOM":
            locationDetails = service.locationUrl ? `Link: ${service.locationUrl}` : "Online";
            break;
    }

    // 3. Determine Client Time Display
    let clientTimeDisplay: string | undefined = undefined;
    if (clientTimeZone && initialDate && dateStr && time) {
        try {
            const clientZonedDate = toZonedTime(initialDate, clientTimeZone);
            const clientDateStr = format(clientZonedDate, "yyyy-MM-dd");
            const clientTimeStr = format(clientZonedDate, "HH:mm");
            clientTimeDisplay = `${clientTimeStr} (${clientTimeZone})`;

            if (clientDateStr !== dateStr) {
                clientTimeDisplay += ` on ${clientDateStr}`;
            }
        } catch (e) {
            console.error("Error formatting client time", e);
        }
    }

    // 4. Send Email to Client
    await sendBookingConfirmation(
        clientData.email,
        clientData.name,
        service.title,
        dateStr || "",
        time || "",
        service.userId,
        locationDetails,
        clientTimeDisplay
    );

    // 5. Send Notification to Provider
    try {
        const prefs = service.user.notificationPreferences as any;
        const shouldSend = !prefs || prefs.email !== false;

        if (shouldSend) {
            await sendNewBookingNotification(
                service.user.email,
                service.user.id,
                clientData.name,
                service.title,
                dateStr || "",
                time || "",
                clientData.answers,
                clientData.clientPhone,
                locationDetails
            );
        }
    } catch (emailError: unknown) {
        console.error("[Booking] Failed to send provider notification.", emailError);
    }
}

export const confirmPaymentAndBooking = async (paymentIntentId: string) => {
    try {
        const { getPaymentIntent } = await import("@/lib/stripe");
        const res = await getPaymentIntent(paymentIntentId);

        if (res.error || !res.paymentIntent) {
            return { error: res.error || "Payment not found" };
        }

        const pi = res.paymentIntent;

        if (pi.status !== "succeeded") {
            return { error: `Payment status is ${pi.status}. Please complete the payment.` };
        }

        // Check if booking already exists (avoid duplicates)
        const existing = await prisma.booking.findFirst({
            where: { paymentIntentId }
        });

        if (existing) {
            return { success: "Booking already confirmed" };
        }

        // Extract data from metadata
        const { serviceId, dateStr, time, timeZone, clientEmail, clientName, notes, answers, recurrence, clientPhone, clientTimeZone } = pi.metadata;

        const service = await prisma.service.findUnique({
            where: { id: serviceId },
            include: { user: true }
        });

        if (!service) return { error: "Service not found" };

        const initialDate = fromZonedTime(`${dateStr} ${time}:00`, timeZone);
        const datesToBook: Date[] = [initialDate];
        let recurrenceId: string | undefined = undefined;

        if (recurrence && recurrence !== "none") {
            recurrenceId = crypto.randomUUID();
            const count = service.maxRecurrenceCount || 4;
            for (let i = 1; i < count; i++) {
                let nextDate = new Date(initialDate);
                if (recurrence === "weekly") nextDate.setDate(initialDate.getDate() + (7 * i));
                else if (recurrence === "biweekly") nextDate.setDate(initialDate.getDate() + (14 * i));
                else if (recurrence === "monthly") nextDate.setMonth(initialDate.getMonth() + i);
                datesToBook.push(nextDate);
            }
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: clientEmail }
        });

        // Create Bookings
        await prisma.$transaction(
            datesToBook.map(date => {
                const startTime = date;
                const endTime = addMinutes(startTime, service.duration);

                return prisma.booking.create({
                    data: {
                        serviceId: service.id,
                        startTime,
                        endTime,
                        clientName,
                        clientEmail,
                        clientPhone: clientPhone || undefined,
                        notes: notes || undefined,
                        answers: JSON.parse(answers || "{}"),
                        recurrenceId,
                        clientTimeZone,
                        status: "CONFIRMED",
                        userId: existingUser?.id,
                        paymentIntentId,
                        paymentStatus: "PAID",
                        amountPaid: pi.amount / 100,
                        currency: pi.currency,
                    }
                });
            })
        );

        // SYNC Calendar and Emails
        await handleBookingFulfillment(
            service,
            datesToBook,
            { name: clientName, email: clientEmail, clientPhone, notes, answers },
            clientTimeZone,
            initialDate,
            dateStr,
            time
        );

        return { success: "Payment confirmed and booking created!" };
    } catch (error: any) {
        console.error("Confirm payment error:", error);
        return { error: error.message };
    }
}
