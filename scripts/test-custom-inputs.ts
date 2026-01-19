
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting Custom Inputs Verification...");

    // 1. Get a test user (or create one, but let's assume one exists)
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error("No user found in DB. Cannot test.");
        return;
    }
    console.log(`Using user: ${user.email} (${user.id})`);

    // 2. Create Service with Custom Inputs
    const customInputs = [
        { id: "field_1", label: "Phone Number", type: "text", required: true },
        { id: "field_2", label: "Age", type: "text", required: false }
    ];

    const service = await prisma.service.create({
        data: {
            userId: user.id,
            title: "Test Custom Service",
            url: "test-custom-service-" + Date.now(),
            duration: 30,
            price: 50,
            customInputs: customInputs as any, // Cast for JSON type
        }
    });
    console.log(`Service created: ${service.id}`);

    // 3. Create Booking with Answers
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 24); // Tomorrow
    const endTime = new Date(startTime.getTime() + 30 * 60000);

    const answers = {
        "Phone Number": "555-0199",
        "Age": "25"
    };

    const booking = await prisma.booking.create({
        data: {
            serviceId: service.id,
            startTime,
            endTime,
            clientName: "Test Client",
            clientEmail: "test@example.com",
            answers: answers as any, // Cast for JSON type
            status: "CONFIRMED"
        }
    });

    // 4. Verify
    console.log(`Booking created: ${booking.id}`);

    const fetchedBooking = await prisma.booking.findUnique({
        where: { id: booking.id }
    });

    if (!fetchedBooking?.answers) {
        console.error("❌ FAILED: Booking has no answers saved.");
    } else {
        const savedAnswers = fetchedBooking.answers as Record<string, string>;
        if (savedAnswers["Phone Number"] === "555-0199") {
            console.log("✅ SUCCESS: Phone Number saved correctly.");
        } else {
            console.error(`❌ FAILED: Expected 555-0199, got ${savedAnswers["Phone Number"]}`);
        }
    }

    // 5. Cleanup
    await prisma.booking.delete({ where: { id: booking.id } });
    await prisma.service.delete({ where: { id: service.id } });
    console.log("Cleanup complete.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
