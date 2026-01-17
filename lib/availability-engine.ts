import { addMinutes, format, parse, isBefore, isAfter, isEqual, startOfDay } from "date-fns";

type AvailabilityRule = {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
};

type Booking = {
    startTime: Date;
    endTime: Date;
};

type AvailabilityException = {
    date: Date;
    isAvailable: boolean;
    startTime: string | null;
    endTime: string | null;
};

export const getAvailableSlots = (
    date: Date,
    duration: number,
    rules: AvailabilityRule[],
    bookings: Booking[],
    timeZone: string,
    bufferTime: number = 0,
    exceptions: AvailabilityException[] = [],
    minNotice: number = 0
) => {
    // 1. Min Notice Filter
    const now = new Date();
    const earliestSlotTime = addMinutes(now, minNotice);

    // 2. Check for Exception first
    const exception = exceptions.find(ex => isEqual(startOfDay(ex.date), startOfDay(date)));

    let ruleStart = "09:00";
    let ruleEnd = "17:00";
    let isDayEnabled = false;

    if (exception) {
        // Exception rules
        if (!exception.isAvailable) return []; // Blocked day

        if (exception.startTime && exception.endTime) {
            ruleStart = exception.startTime;
            ruleEnd = exception.endTime;
            isDayEnabled = true;
        }
    } else {
        // Weekly rules
        const dayOfWeek = date.getDay();
        const rule = rules.find(r => r.dayOfWeek === dayOfWeek);
        if (rule) {
            ruleStart = rule.startTime;
            ruleEnd = rule.endTime;
            isDayEnabled = true; // Assuming existing enabled check is done upstream or implies enabled
        }
    }

    if (!isDayEnabled) return [];

    const slots: string[] = [];

    // Parse rule start/end times
    const dayStart = parse(ruleStart, "HH:mm", date);
    const dayEnd = parse(ruleEnd, "HH:mm", date);

    let currentSlot = dayStart;

    while (isBefore(currentSlot, dayEnd)) {
        const slotEnd = addMinutes(currentSlot, duration);
        const effectiveEnd = addMinutes(slotEnd, bufferTime);

        if (isAfter(effectiveEnd, dayEnd)) break;

        // Min Notice Check
        if (isBefore(currentSlot, earliestSlotTime)) {
            currentSlot = addMinutes(currentSlot, duration);
            continue;
        }

        // Check conflicts
        const isConflict = bookings.some(booking => {
            // Check overlap with effective range [currentSlot, effectiveEnd)
            return isBefore(currentSlot, booking.endTime) && isAfter(effectiveEnd, booking.startTime);
        });

        if (!isConflict) {
            slots.push(format(currentSlot, "HH:mm"));
        }

        // Increment logic
        currentSlot = addMinutes(currentSlot, duration);
    }

    return slots;
};
