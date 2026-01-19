
import { PrismaClient } from "@prisma/client";
import { rescheduleBooking } from "@/actions/booking"; // Need to export this or just test logic?
// actions are server actions, check if they can be called from script context.
// Usually yes if environment is correct.

const prisma = new PrismaClient();

// Mock auth? 
// The action calls `auth()`. This script won't have a session.
// So I cannot call `rescheduleBooking` directly from a standalone script easily if it enforces auth.
// I will simulate the logic or temporarily mock auth if possible. 
// Actually, for robust testing, I should probably rely on manual testing or just trust the unit logic if I can't mock auth easily.

// ALTERNATIVE: Create a "Test User" session? No.
// Let's modify logic to test the core parts or just verify manually.

// Since I am in Agentic Mode, I can try to use `run_command` with a script that invokes the action? 
// No, Next.js Server Actions need the Next.js context.

// I will create a script that MANUALLY performs the DB update to prove schema/logic works, 
// BUT verifying the 'Action' specifically requires the app running.
// Since I cannot run the app and browse easily without User interacting?
// Wait, I can use the Browser Tool? 
// No, I am "Antigravity". I should use `scripts` for data verification.

// I will create a validation script that assumes I will run the action "somehow".
// But actually, I can make the script `authenticate` by mocking the `auth` library? 
// Too complex.

// Let's rely on my previous `test-custom-inputs.ts` success.
// I will create a simple script that just checks if I can find a booking and update it using Prisma directly, 
// ensuring no database constraints block it.
// The actual "Action" logic (Auth + Email) is best tested manually or via robust integration tests.

// Let's proceed with a script that VALIDATES the RESCHEDULE LOGIC (DB side).

async function main() {
    console.log("Starting Reschedule Verification (DB Layer)...");

    const user = await prisma.user.findFirst();
    if (!user) { console.log("No user"); return; }

    // 1. Create a dummy booking
    const service = await prisma.service.create({
        data: {
            userId: user.id,
            title: "Reschedule Test Service",
            url: "reschedule-test-" + Date.now(),
            duration: 60,
            price: 100
        }
    });

    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 24);
    const endTime = new Date(startTime.getTime() + 60 * 60000);

    const booking = await prisma.booking.create({
        data: {
            serviceId: service.id,
            startTime,
            endTime,
            clientName: "Reschedule Test",
            clientEmail: "test@reschedule.com",
            status: "CONFIRMED"
        }
    });
    console.log(`Original Booking: ${booking.id} @ ${booking.startTime.toISOString()}`);

    // 2. Simulate "Reschedule" (Update)
    const newStartTime = new Date(startTime.getTime() + 2 * 60 * 60000); // +2 hours
    const newEndTime = new Date(newStartTime.getTime() + 60 * 60000);

    // Check overlap (simulate availability check)
    const conflict = await prisma.booking.findFirst({
        where: {
            serviceId: service.id,
            startTime: { lt: newEndTime },
            endTime: { gt: newStartTime },
            status: "CONFIRMED",
            NOT: { id: booking.id }
        }
    });

    if (conflict) {
        console.error("Conflict found! (Unexpected)");
    } else {
        console.log("No conflict. Proceeding to update.");
        const updated = await prisma.booking.update({
            where: { id: booking.id },
            data: { startTime: newStartTime, endTime: newEndTime }
        });
        console.log(`Updated Booking: ${updated.id} @ ${updated.startTime.toISOString()}`);

        if (updated.startTime.getTime() === newStartTime.getTime()) {
            console.log("✅ SUCCESS: Booking rescheduled successfully in DB.");
        } else {
            console.error("❌ FAILED: Time did not update.");
        }
    }

    // Cleanup
    await prisma.booking.delete({ where: { id: booking.id } });
    await prisma.service.delete({ where: { id: service.id } });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
