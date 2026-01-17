"use server";

import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/availability-engine";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

import { startOfDay, endOfDay, addMinutes, parse } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { sendBookingConfirmation, sendNewBookingNotification } from "@/lib/mail";
import { getBusyTimes } from "@/lib/google-calendar";


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
    clientData: { name: string; email: string; notes?: string }
) => {
    // 1. Verify existence
    const service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: { user: true }
    });
    if (!service) return { error: "Service not found" };

    // 2. Parse Start/End
    // dateStr: YYYY-MM-DD, time: HH:mm
    const startTime = new Date(`${dateStr}T${time}:00`);
    const endTime = addMinutes(startTime, service.duration);
    const effectiveEndTime = addMinutes(endTime, service.bufferTime || 0);

    // 2a. Min Notice Check
    const minNoticeTime = addMinutes(new Date(), service.minNotice);
    if (startTime < minNoticeTime) {
        return { error: `Booking requires at least ${service.minNotice} minutes notice` };
    }

    // 3. Double check availability (Race condition check omitted for MVP, but good to have)
    // ongoing booking [startTime, effectiveEndTime) must not overlap with any existing booking
    const existing = await prisma.booking.findFirst({
        where: {
            serviceId: service.id,
            startTime: { lt: effectiveEndTime },
            endTime: { gt: startTime },
            status: "CONFIRMED"
        }
    });

    if (existing) return { error: "Slot already taken" };

    // 4. Create
    await prisma.booking.create({
        data: {
            serviceId,
            startTime,
            endTime,
            clientName: clientData.name,
            clientEmail: clientData.email,
            notes: clientData.notes,
            status: "CONFIRMED",
            // professionalId: service.userId // If I added it to schema
        }
    });

    // Send Email to Client
    await sendBookingConfirmation(
        clientData.email,
        clientData.name,
        service.title,
        dateStr,
        time
    );

    // Send Notification to Provider
    // Send Notification to Provider
    try {
        interface NotificationPreferences {
            email?: boolean;
            sms?: boolean;
        }

        const prefs = service.user.notificationPreferences as unknown as NotificationPreferences | null;

        console.log(`[Booking] Checking prefs for user ${service.user.email}:`, prefs);

        // Logic: Send email if preferences are null (default) OR if email is not explicitly set to false
        const shouldSend = !prefs || prefs.email !== false;

        if (shouldSend) {
            console.log(`[Booking] Sending notification to provider: ${service.user.email}`);
            await sendNewBookingNotification(
                service.user.email,
                service.user.id,
                clientData.name,
                service.title,
                dateStr,
                time
            );
            console.log("[Booking] Provider notification sent successfully");
        } else {
            console.log("[Booking] Provider notifications disabled by preference");
        }
    } catch (emailError: unknown) {
        console.error("[Booking] Failed to send provider notification. Error details:", emailError);
        console.error("[Booking] Attempted to send from:", process.env.EMAIL_FROM);
        console.error("[Booking] Attempted to send to:", service.user.email);
        // Don't fail the booking if email fails, but log it
    }

    return { success: "Booking confirmed!" };
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
        include: { service: true }
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

    revalidatePath("/dashboard/bookings");
    revalidatePath("/dashboard");
    return { success: "Booking cancelled" };
};
