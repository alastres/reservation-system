import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { addHours, addMinutes } from "date-fns";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting seed script...");
    const user = await prisma.user.findFirst({
        where: { services: { some: {} } },
        include: { services: true },
    });

    if (!user || user.services.length === 0) {
        console.error("No user or service found to attach booking to.");
        return;
    }

    const service = user.services[0];
    console.log(`Using User: ${user.id}, Service: ${service.id}`);

    const now = new Date(); // This is local time execution, but creates Date object (UTC internally)

    // 1. Create Booking for 24h Reminder (Now + 24h)
    const time24h = addHours(now, 24);
    try {
        const booking24h = await prisma.booking.create({
            data: {
                serviceId: service.id,
                userId: user.id,
                clientName: "Test 24h Client",
                clientEmail: "test24h@example.com",
                startTime: time24h,
                endTime: addMinutes(time24h, 30),
                status: "CONFIRMED",
            },
        });
        console.log(`Created 24h Booking: ${booking24h.id} at ${time24h.toISOString()}`);
    } catch (e) {
        console.error("Failed to create 24h booking:", e);
    }

    // 2. Create Booking for 1h Reminder (Now + 1h)
    const time1h = addHours(now, 1);
    try {
        const booking1h = await prisma.booking.create({
            data: {
                serviceId: service.id,
                userId: user.id,
                clientName: "Test 1h Client",
                clientEmail: "test1h@example.com",
                startTime: time1h,
                endTime: addMinutes(time1h, 30),
                status: "CONFIRMED",
            },
        });
        console.log(`Created 1h Booking: ${booking1h.id} at ${time1h.toISOString()}`);
    } catch (e) {
        console.error("Failed to create 1h booking:", e);
    }
}

main()
    .catch((e) => {
        console.error("Main error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
