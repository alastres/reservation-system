import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingReminder } from "@/lib/mail";
import { addMinutes, subHours, format } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    // Basic Auth Check for Cron
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const results = {
        reminders24h: 0,
        reminders1h: 0,
        errors: 0
    };

    try {
        // --- 24 Hour Reminders ---
        // Target: Bookings starting 24h from now (+/- 15 mins)
        const start24h = addMinutes(now, 24 * 60 - 20); // 23h 40m
        const end24h = addMinutes(now, 24 * 60 + 20);   // 24h 20m

        const bookings24h = await prisma.booking.findMany({
            where: {
                status: "CONFIRMED",
                startTime: {
                    gte: start24h,
                    lte: end24h
                }
            },
            include: { service: { include: { user: true } } }
        });

        for (const booking of bookings24h) {
            // Idempotency Check: Did we already send this?
            // Fetch logs for this provider in the last 2 days
            const existingLogs = await prisma.notificationLog.findMany({
                where: {
                    // userId: booking.service.userId, // Optionally filter by user
                    type: "REMINDER_24H",
                    createdAt: {
                        gte: subHours(now, 48) // Look back 48h to be safe
                    }
                }
            });

            const alreadySent = existingLogs.some(log => (log.metadata as any)?.bookingId === booking.id);

            if (!alreadySent) {
                // Determine Address
                const finalAddress = booking.service.locationType === "IN_PERSON"
                    ? (booking.service.address || booking.service.user.address)
                    : undefined;

                let locationDetails = "";
                switch (booking.service.locationType) {
                    case "GOOGLE_MEET":
                        locationDetails = "Google Meet (Link in Calendar)";
                        break;
                    case "PHONE":
                        locationDetails = booking.clientPhone
                            ? `Phone Call (Provider will call you at ${booking.clientPhone})`
                            : "Phone Call";
                        break;
                    case "IN_PERSON":
                        locationDetails = finalAddress ? `In Person at ${finalAddress}` : "In Person";
                        break;
                    case "CUSTOM":
                        locationDetails = booking.service.locationUrl ? `Link: ${booking.service.locationUrl}` : "Online";
                        break;
                }

                await sendBookingReminder(
                    booking.clientEmail,
                    booking.clientName,
                    booking.service.title,
                    format(booking.startTime, "yyyy-MM-dd"),
                    format(booking.startTime, "HH:mm"),
                    booking.service.userId,
                    "24h",
                    booking.id,
                    locationDetails
                );
                results.reminders24h++;
            }
        }

        // --- 1 Hour Reminders ---
        // Target: Bookings starting 1h from now (+/- 15 mins)
        const start1h = addMinutes(now, 60 - 15);
        const end1h = addMinutes(now, 60 + 15);

        const bookings1h = await prisma.booking.findMany({
            where: {
                status: "CONFIRMED",
                startTime: {
                    gte: start1h,
                    lte: end1h
                }
            },
            include: { service: { include: { user: true } } }
        });

        for (const booking of bookings1h) {
            // Idempotency Check
            const existingLogs = await prisma.notificationLog.findMany({
                where: {
                    type: "REMINDER_1H",
                    createdAt: {
                        gte: subHours(now, 24) // Look back 24h
                    }
                }
            });

            const alreadySent = existingLogs.some(log => (log.metadata as any)?.bookingId === booking.id);

            if (!alreadySent) {
                // Determine Address (Reuse logic or extract function)
                const finalAddress = booking.service.locationType === "IN_PERSON"
                    ? (booking.service.address || booking.service.user.address)
                    : undefined;

                let locationDetails = "";
                switch (booking.service.locationType) {
                    case "GOOGLE_MEET":
                        locationDetails = "Google Meet (Link in Calendar)";
                        break;
                    case "PHONE":
                        locationDetails = booking.clientPhone
                            ? `Phone Call (Provider will call you at ${booking.clientPhone})`
                            : "Phone Call";
                        break;
                    case "IN_PERSON":
                        locationDetails = finalAddress ? `In Person at ${finalAddress}` : "In Person";
                        break;
                    case "CUSTOM":
                        locationDetails = booking.service.locationUrl ? `Link: ${booking.service.locationUrl}` : "Online";
                        break;
                }

                await sendBookingReminder(
                    booking.clientEmail,
                    booking.clientName,
                    booking.service.title,
                    format(booking.startTime, "yyyy-MM-dd"),
                    format(booking.startTime, "HH:mm"),
                    booking.service.userId,
                    "1h",
                    booking.id,
                    locationDetails
                );
                results.reminders1h++;
            }
        }

        return NextResponse.json({ success: true, results });

    } catch (e) {
        console.error("Cron failed", e);
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
