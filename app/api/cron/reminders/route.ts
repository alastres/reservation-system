import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingReminder } from "@/lib/mail";
import { addHours, subMinutes, addMinutes } from "date-fns";

// Force dynamic to ensure it runs every time
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        // Authenticate the cron request (Vercel adds this header)
        const authHeader = req.headers.get('authorization');
        // In local dev we might skip this or use a manual secret
        // For Vercel Cron, typically CRON_SECRET env var is used if we want to secure it manually, 
        // but Vercel protects it automatically if configured via vercel.json for internal invocation.
        // However, checking for a secret header is good practice if exposing to public.
        // const { CRON_SECRET } = process.env;
        // if (authHeader !== `Bearer ${CRON_SECRET}`) { ... }

        const now = new Date();

        // 1. 24 Hour Reminders
        // Look for bookings tomorrow (between 24h and 24h + 15m from now)
        // Adjust window size based on cron frequency (10 mins)
        const start24 = addHours(now, 24);
        const end24 = addMinutes(start24, 15);

        const bookings24 = await prisma.booking.findMany({
            where: {
                startTime: {
                    gte: start24,
                    lte: end24
                },
                status: "CONFIRMED",
            },
            include: {
                user: true, // The provider
                service: true,
            }
        });

        for (const booking of bookings24) {
            // Check if already sent
            const logs = await prisma.notificationLog.findFirst({
                where: {
                    metadata: {
                        path: ['bookingId'],
                        equals: booking.id
                    },
                    type: "REMINDER_24H",
                    status: "SENT"
                }
            });

            if (!logs) {
                await sendBookingReminder(
                    booking.clientEmail,
                    booking.clientName,
                    booking.service.title,
                    booking.startTime.toISOString().split("T")[0], // Simple date
                    booking.startTime.toISOString().split("T")[1].substring(0, 5), // Simple time
                    booking.userId,
                    "24h",
                    booking.id,
                    booking.service.location
                );
            }
        }

        // 2. 1 Hour Reminders
        const start1 = addHours(now, 1);
        const end1 = addMinutes(start1, 15);

        const bookings1 = await prisma.booking.findMany({
            where: {
                startTime: {
                    gte: start1,
                    lte: end1
                },
                status: "CONFIRMED",
            },
            include: {
                user: true,
                service: true
            }
        });

        for (const booking of bookings1) {
            const logs = await prisma.notificationLog.findFirst({
                where: {
                    metadata: {
                        path: ['bookingId'],
                        equals: booking.id
                    },
                    type: "REMINDER_1H",
                    status: "SENT"
                }
            });

            if (!logs) {
                await sendBookingReminder(
                    booking.clientEmail,
                    booking.clientName,
                    booking.service.title,
                    booking.startTime.toISOString().split("T")[0],
                    booking.startTime.toISOString().split("T")[1].substring(0, 5),
                    booking.userId,
                    "1h",
                    booking.id,
                    booking.service.location
                );
            }
        }

        return NextResponse.json({ success: true, processed: bookings24.length + bookings1.length });
    } catch (error) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
