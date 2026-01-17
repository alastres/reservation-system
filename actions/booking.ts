"use server";

import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/availability-engine";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

import { startOfDay, endOfDay, addMinutes, parse } from "date-fns";
import { sendBookingConfirmation, sendNewBookingNotification } from "@/lib/mail";
import { getBusyTimes } from "@/lib/google-calendar";


export const getSlotsAction = async (dateStr: string, serviceId: string, timeZone: string) => {
    // dateStr is iso date "YYYY-MM-DD"
    const service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: { user: { include: { availability: true, bookings: true } } }
    });

    if (!service) return { error: "Service not found" };

    const date = new Date(dateStr); // Local midnight of that date (server time)
    // Ideally we should parse based on user timezone.

    // Fetch bookings for that day (roughly)
    // We fetch bookings that overlap with this day
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

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
        date,
        service.duration,
        service.user.availability,
        allBusySlots,
        timeZone,
        service.bufferTime
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
    const prefs = service.user.notificationPreferences as any;
    if (prefs?.email !== false) {
        await sendNewBookingNotification(
            service.user.email,
            service.user.id,
            clientData.name,
            service.title,
            dateStr,
            time
        );
    }

    return { success: "Booking confirmed!" };
};

export const cancelBooking = async (bookingId: string) => {
    const session = await auth(); // Assuming auth() is available here or passed down. 
    // Wait, auth() is in @/auth. Need to import it if not present. It is present.

    if (!session?.user?.id) return { error: "Unauthorized" };

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { service: true }
    });

    if (!booking) return { error: "Booking not found" };

    // Verify ownership
    if (booking.service.userId !== session.user.id) {
        return { error: "Unauthorized" };
    }

    await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" }
    });

    // Ideally send cancellation email here

    revalidatePath("/dashboard/bookings");
    revalidatePath("/dashboard");
    return { success: "Booking cancelled" };
};
