"use client";

import { useState, useEffect, useTransition } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { getSlotsAction, createBooking } from "@/actions/booking";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";

interface BookingCalendarProps {
    service: any;
    user: any;
}

export const BookingCalendar = ({ service, user }: BookingCalendarProps) => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [slots, setSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [bookingStage, setBookingStage] = useState<"SLOT" | "FORM" | "SUCCESS">("SLOT");

    // Booking Form
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [notes, setNotes] = useState("");
    const [isBooking, startBooking] = useTransition();
    const [bookingError, setBookingError] = useState("");

    // Fetch slots when date changes
    useEffect(() => {
        if (!date) return;

        const fetchSlots = async () => {
            setLoadingSlots(true);
            setSlots([]);
            setSelectedSlot(null);
            setBookingStage("SLOT");

            try {
                const dateStr = format(date, "yyyy-MM-dd");
                const res = await getSlotsAction(dateStr, service.id, "UTC"); // User timezone handling needed
                if (res.slots) {
                    setSlots(res.slots);
                }
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchSlots();
    }, [date, service.id]);

    const handleSlotClick = (slot: string) => {
        setSelectedSlot(slot);
        setBookingStage("FORM");
    };

    const handleConfirmBooking = () => {
        if (!date || !selectedSlot) return;
        if (!name || !email) {
            setBookingError("Name and Email are required");
            return;
        }

        setBookingError("");
        const dateStr = format(date, "yyyy-MM-dd");

        startBooking(() => {
            createBooking(service.id, dateStr, selectedSlot, { name, email, notes })
                .then((data) => {
                    if (data.error) setBookingError(data.error);
                    if (data.success) setBookingStage("SUCCESS");
                });
        });
    };

    if (bookingStage === "SUCCESS") {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="h-6 w-6 text-green-600">✓</div>
                </div>
                <h2 className="text-xl font-bold">Booking Confirmed!</h2>
                <p className="text-gray-500 text-center">
                    You have booked {service.title} with {user.name} on {date ? format(date, "PPPP") : ""} at {selectedSlot}.
                </p>
                <p className="text-sm text-gray-400">A confirmation email has been sent to {email}.</p>
                <Button variant="outline" onClick={() => window.location.reload()}>Book Another</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row h-full gap-6">
            <div className="md:w-[350px] flex-shrink-0 flex justify-center border-r md:pr-6">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border shadow-sm p-4"
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
            </div>

            <div className="flex-1 overflow-y-auto">
                <h3 className="font-semibold mb-4 text-lg">
                    {date ? format(date, "EEEE, MMMM do") : "Select a date"}
                </h3>

                {loadingSlots ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <>
                        {bookingStage === "SLOT" && (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                {slots.length === 0 ? (
                                    <p className="col-span-full text-gray-500 text-center py-10">No slots available for this day.</p>
                                ) : (
                                    slots.map((slot) => (
                                        <Button
                                            key={slot}
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => handleSlotClick(slot)}
                                        >
                                            {slot}
                                        </Button>
                                    ))
                                )}
                            </div>
                        )}

                        {bookingStage === "FORM" && (
                            <div className="max-w-md space-y-4 animate-in fade-in slide-in-from-right-4">
                                <div className="mb-4 p-3 bg-slate-50 border rounded text-sm">
                                    <span className="font-semibold text-gray-700">Selected Time:</span> {date && format(date, "MMM dd")} @ {selectedSlot}
                                    <Button variant="link" size="sm" onClick={() => setBookingStage("SLOT")} className="ml-2 text-sky-600 p-0 h-auto">Change</Button>
                                </div>

                                <div className="space-y-2">
                                    <Label>Your Name</Label>
                                    <Input placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} disabled={isBooking} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <Input type="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} disabled={isBooking} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Additional Notes</Label>
                                    <Textarea placeholder="Any specific topics?" value={notes} onChange={e => setNotes(e.target.value)} disabled={isBooking} />
                                </div>

                                <FormError message={bookingError} />

                                <div className="pt-2 flex gap-3">
                                    <Button variant="ghost" onClick={() => setBookingStage("SLOT")} disabled={isBooking}>Back</Button>
                                    <Button className="flex-1" onClick={handleConfirmBooking} disabled={isBooking}>
                                        {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Confirm Booking
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
