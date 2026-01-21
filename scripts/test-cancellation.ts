
import { prisma } from "../lib/prisma";
import { getSlotsAction, createBooking, cancelBooking } from "../actions/booking";
import { addDays, format, addHours } from "date-fns";

async function main() {
    console.log("--- Starting Cancellation Test ---");

    // 1. Create a test user and service
    const email = `test-user-${Date.now()}@example.com`;
    const user = await prisma.user.create({
        data: {
            email,
            username: `testuser${Date.now()}`,
            services: {
                create: {
                    title: "Test Service",
                    duration: 30,
                    url: `test-service-${Date.now()}`,
                    minNotice: 0, // Disable min notice to avoid confusion

                }
            }
        },
        include: { services: true }
    });

    const service = user.services[0];
    console.log("Created Service:", service.id);

    // 2. Define a slot for today + 1 hour (safe from minNotice even if 0)
    const today = new Date();
    const targetDate = format(today, "yyyy-MM-dd");
    const targetTime = "12:00"; // Pick a fixed time, e.g. noon

    console.log(`Checking availability for ${targetDate} at ${targetTime}...`);

    // 3. Check initial availability
    let res = await getSlotsAction(targetDate, service.id, "UTC");
    if (res.error) {
        console.error("Initial check failed", res.error);
        return;
    }
    let initialSlots = res.slots || [];
    const isAvailableInitially = initialSlots.includes(targetTime);
    console.log(`Is 12:00 available initially? ${isAvailableInitially}`);

    if (!isAvailableInitially) {
        console.error("Slot should be available! Aborting.");
        // Force cleanup
        await prisma.user.delete({ where: { id: user.id } });
        return;
    }

    // 4. Book the slot
    console.log("Booking the slot...");
    const bookRes = await createBooking(service.id, targetDate, targetTime, {
        name: "Test Client",
        email: "client@example.com"
    });

    if (bookRes.error) {
        console.error("Booking failed", bookRes.error);
        await prisma.user.delete({ where: { id: user.id } });
        return;
    }
    console.log("Booking successful.");

    // 5. Check availability again (should be gone)
    res = await getSlotsAction(targetDate, service.id, "UTC");
    const slotsAfterBooking = res.slots || [];
    const isAvailableAfterBooking = slotsAfterBooking.includes(targetTime);
    console.log(`Is 12:00 available after booking? ${isAvailableAfterBooking}`);

    if (isAvailableAfterBooking) {
        console.error("Slot should be TAKEN! backend logic failed?");
    } else {
        console.log("Slot correctly taken.");
    }

    // 6. Cancel the booking
    // Find the booking ID
    const booking = await prisma.booking.findFirst({
        where: { serviceId: service.id }
    });

    if (!booking) { console.error("Booking not found in DB"); return; }

    // Update status manually or mock session for cancelAction?
    // cancelBooking calls auth(), which we can't easily mock in script without hacking.
    // So we will simulate what cancelBooking does: update status.
    console.log("Cancelling booking (simulating DB update)...");
    await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "CANCELLED" }
    });

    // 7. Check availability again (should be free)
    res = await getSlotsAction(targetDate, service.id, "UTC");
    const slotsAfterCancel = res.slots || [];
    const isAvailableAfterCancel = slotsAfterCancel.includes(targetTime);
    console.log(`Is 12:00 available after cancellation? ${isAvailableAfterCancel}`);

    if (!isAvailableAfterCancel) {
        console.error("FAIL: Slot is still blocked after cancellation!");
    } else {
        console.log("SUCCESS: Slot is free again.");
    }

    // Cleanup
    await prisma.user.delete({ where: { id: user.id } });
    console.log("Cleanup done.");
}

main().catch(console.error);
