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
        include: { user: { include: { availability: true, bookings: true, exceptions: true } } }
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

    // Fetch Google Calendar Busy Times
    const googleBusyTimes = await getBusyTimes(service.userId, dayStart, dayEnd);

    // Merge bookings and busy times
    const allBusySlots = [
        ...bookings,
        ...googleBusyTimes.map(busy => ({
            startTime: new Date(busy.start!),
            endTime: new Date(busy.end!)
        }))
    ];


    const slots = getAvailableSlots(
        startOfDayInZone, // Use the calculate start of day
        service.duration,
        service.user.availability,
        allBusySlots,
        timeZone,
        service.bufferTime,
        service.user.exceptions,
        service.minNotice
    );

    return { slots };
};

export const createBooking = async (
    serviceId: string,
    dateStr: string,
    time: string,
    clientData: { name: string; email: string; clientPhone?: string; notes?: string; answers?: Record<string, string>; recurrence?: string }
) => {
    // 1. Verify existence
    const service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: { user: true }
    });
    if (!service) return { error: "Service not found" };

    // 2. Determine Dates to Book
    const initialDate = new Date(`${dateStr}T${time}:00`);
    const datesToBook: Date[] = [initialDate];
    let recurrenceId: string | undefined = undefined;

    if (clientData.recurrence && clientData.recurrence !== "none") {
        recurrenceId = crypto.randomUUID();
        // Generate future dates based on service config
        const count = service.maxRecurrenceCount || 4;
        for (let i = 1; i < count; i++) {
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
    // This could be optimized to a custom query, but for MVP loop is fine or `findMany` with OR
    for (const date of datesToBook) {
        const checkStart = date;
        const checkEnd = addMinutes(checkStart, service.duration);
        const checkBuffEnd = addMinutes(checkEnd, service.bufferTime || 0);

        const existing = await prisma.booking.findFirst({
            where: {
                serviceId: service.id,
                startTime: { lt: checkBuffEnd },
                endTime: { gt: checkStart },
                status: "CONFIRMED"
            }
        });

        if (existing) {
            const conflictDate = format(checkStart, "yyyy-MM-dd");
            return { error: `Slot on ${conflictDate} is already taken. Recurrence failed.` };
        }
    }

    // 4. Create All Bookings
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
                        status: "CONFIRMED",
                    }
                });
            })
        );
    } catch (e) {
        console.error("Booking transaction failed", e);
        return { error: "Failed to process booking" };
    }

    // Sync with Google Calendar
    // We execute this asynchronously/independently so it doesn't block the UI response if it's slow
    // But we await it here to ensure it's done before returning (Vercel serverless might kill otherwise)
    // In a real message queue system, this would be a job.
    for (const date of datesToBook) {
        const start = date;
        const end = addMinutes(start, service.duration);

        let description = `Client: ${clientData.name}\nEmail: ${clientData.email}\nNotes: ${clientData.notes || "None"}`;

        if (clientData.clientPhone) {
            description += `\nPhone: ${clientData.clientPhone}`;
        }

        if (clientData.answers) {
            description += "\n\nAnswers:\n" + Object.entries(clientData.answers).map(([q, a]) => `- ${q}: ${a}`).join("\n");
        }

        // Determine Final Address (Service specific OR Profile default)
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
            // Find the specific booking for this date interval
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
                        joinUrl: eventResult.meetLink // Will be null if not generated
                    }
                });
            }
        }
    }

    // Determine Location Details for Email
    let locationDetails = "";
    const finalAddress = service.address || service.user.address; // Re-calculate or reuse if scope allows

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

    // Send Email to Client (Summary)
    await sendBookingConfirmation(
        clientData.email,
        clientData.name,
        service.title,
        dateStr,
        time, // Todo: Mention recurrence in email
        locationDetails
    );

    // Send Notification to Provider (Summary)
    try {
        interface NotificationPreferences {
            email?: boolean;
            sms?: boolean;
        }

        const prefs = service.user.notificationPreferences as unknown as NotificationPreferences | null;
        const shouldSend = !prefs || prefs.email !== false;

        if (shouldSend) {
            await sendNewBookingNotification(
                service.user.email,
                service.user.id,
                clientData.name,
                service.title,
                dateStr,
                time,
                clientData.answers,
                clientData.clientPhone, // Pass phone number
                locationDetails // Pass location details
            );
        }
    } catch (emailError: unknown) {
        console.error("[Booking] Failed to send provider notification.", emailError);
    }

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
        format(booking.startTime, "HH:mm")
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
        oldDateStr,
        oldTimeStr
    );

    revalidatePath("/dashboard/bookings");
    return { success: "Booking rescheduled successfully" };
};
