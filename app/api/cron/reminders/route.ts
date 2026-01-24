import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingReminder } from "@/lib/mail";
import { addHours, subMinutes, addMinutes } from "date-fns";

// Force dynamic to ensure it runs every time
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const now = new Date();

        // 1. 24 Hour Reminders
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
                user: true, // The client (optional)
                service: true, // The service (has userId = provider)
            }
        });

        for (const booking of bookings24) {
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
                const email = booking.clientEmail ?? "";
                const name = booking.clientName ?? "Client";
                const location = booking.service.location ?? "Online";

                // Use service.userId as the providerId for logging and context
                await sendBookingReminder(
                    email,
                    name,
                    booking.service.title,
                    booking.startTime.toISOString().split("T")[0],
                    booking.startTime.toISOString().split("T")[1].substring(0, 5),
                    booking.service.userId,
                    "24h",
                    booking.id,
                    location
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
                const email = booking.clientEmail ?? "";
                const name = booking.clientName ?? "Client";
                const location = booking.service.location ?? "Online";

                await sendBookingReminder(
                    email,
                    name,
                    booking.service.title,
                    booking.startTime.toISOString().split("T")[0],
                    booking.startTime.toISOString().split("T")[1].substring(0, 5),
                    booking.service.userId,
                    "1h",
                    booking.id,
                    location
                );
            }
        }

        return NextResponse.json({ success: true, processed: bookings24.length + bookings1.length });
    } catch (error) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
