import { addMinutes, format, parse, isBefore, isAfter, isEqual } from "date-fns";

type AvailabilityRule = {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
};

type Booking = {
    startTime: Date;
    endTime: Date;
};

export const getAvailableSlots = (
    date: Date,
    duration: number,
    rules: AvailabilityRule[],
    bookings: Booking[],
    timeZone: string,
    bufferTime: number = 0
) => {
    const dayOfWeek = date.getDay();
    const rule = rules.find(r => r.dayOfWeek === dayOfWeek);

    if (!rule) return [];

    const slots: string[] = [];

    // Parse rule start/end times
    const dayStart = parse(rule.startTime, "HH:mm", date);
    const dayEnd = parse(rule.endTime, "HH:mm", date);

    let currentSlot = dayStart;

    while (isBefore(currentSlot, dayEnd)) {
        const slotEnd = addMinutes(currentSlot, duration);
        const effectiveEnd = addMinutes(slotEnd, bufferTime);

        if (isAfter(effectiveEnd, dayEnd)) break;

        // Check conflicts
        const isConflict = bookings.some(booking => {
            // Check overlap with effective range [currentSlot, effectiveEnd)
            return isBefore(currentSlot, booking.endTime) && isAfter(effectiveEnd, booking.startTime);
        });

        if (!isConflict) {
            slots.push(format(currentSlot, "HH:mm"));
        }

        // Increment logic
        // We stick to 'duration' steps for consistency with typical slot generators
        // But users might expect slots to align with buffer? 
        // For now, simple duration steps (e.g., 9:00, 9:30, 10:00) 
        // regardless of whether the *previous* theoretical slot had a buffer.
        currentSlot = addMinutes(currentSlot, duration);
    }

    return slots;
};
