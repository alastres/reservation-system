"use client";

import { useState, useEffect, useTransition } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { getSlotsAction, rescheduleBooking } from "@/actions/booking";
import { useTranslations } from "next-intl";

interface RescheduleDialogProps {
    booking: {
        id: string;
        service: {
            id: string;
            duration: number;
        };
        startTime: Date;
    };
}

export function RescheduleDialog({ booking }: RescheduleDialogProps) {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [slots, setSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const router = useRouter();
    const t = useTranslations("Bookings.reschedule");
    const tToast = useTranslations("Bookings.reschedule"); // Use generic bookings or specific for success

    // Reset state when dialog opens
    useEffect(() => {
        if (open) {
            setDate(undefined);
            setSlots([]);
            setSelectedSlot(null);
        }
    }, [open]);

    // Fetch slots when date changes
    useEffect(() => {
        if (!date) return;

        const fetchSlots = async () => {
            setLoadingSlots(true);
            setSlots([]);
            setSelectedSlot(null);

            try {
                const dateStr = format(date, "yyyy-MM-dd");
                const res = await getSlotsAction(dateStr, booking.service.id, "UTC"); // Todo: Timezone
                if (res.slots) {
                    setSlots(res.slots);
                }
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchSlots();
    }, [date, booking.service.id]);

    const handleConfirm = () => {
        if (!date || !selectedSlot) return;

        startTransition(async () => {
            const dateStr = format(date, "yyyy-MM-dd");
            const res = await rescheduleBooking(booking.id, dateStr, selectedSlot);

            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success(t('success'));
                setOpen(false);
                router.refresh();
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="mr-2">
                    <CalendarClock className="w-4 h-4 mr-2" />
                    {t('button')}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl w-full max-h-[95vh] flex flex-col p-6 overflow-hidden">
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                    <DialogDescription>
                        {t('description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 min-h-0 pt-4 overflow-y-auto">
                    {!date ? (
                        <div className="flex justify-center items-center h-full">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border shadow-sm p-4 h-fit bg-card"
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col h-full space-y-4">
                            <div className="flex items-center justify-between sticky top-0 bg-background z-10 py-2 border-b">
                                <h3 className="font-semibold text-lg">
                                    {format(date, "EEEE, MMMM do")}
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setDate(undefined);
                                        setSlots([]);
                                        setSelectedSlot(null);
                                    }}
                                >
                                    {t('changeDate')}
                                </Button>
                            </div>

                            {loadingSlots ? (
                                <div className="flex items-center justify-center flex-1">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-8">
                                    {slots.length === 0 && (
                                        <p className="col-span-full text-muted-foreground text-center py-10">{t('noSlots')}</p>
                                    )}
                                    {slots.map((slot) => (
                                        <Button
                                            key={slot}
                                            variant={selectedSlot === slot ? "default" : "outline"}
                                            className="w-full h-11 text-sm font-medium transition-all hover:scale-105"
                                            onClick={() => setSelectedSlot(slot)}
                                            disabled={isPending}
                                        >
                                            {slot}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t mt-auto">
                    <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>{t('cancel')}</Button>
                    <Button onClick={handleConfirm} disabled={!date || !selectedSlot || isPending}>
                        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {t('confirm')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
