"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday
} from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Phone } from "lucide-react";
import { CancelBookingButton } from "./booking-action";
import { RescheduleDialog } from "./reschedule-dialog"; // Import new dialog

type Booking = {
    id: string;
    startTime: Date;
    endTime: Date;
    clientName: string;
    clientEmail: string;
    clientPhone?: string | null;
    status: string;
    service: {
        id: string;
        title: string;
        color: string;
        locationType?: string;
        address?: string | null;
        user?: {
            address?: string | null;
            phone?: string | null;
        }
    };
};

type Service = {
    id: string;
    title: string;
    color: string;
};

interface CalendarViewProps {
    bookings: Booking[];
    services: Service[];
}

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

export function CalendarView({ bookings, services }: CalendarViewProps) {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
    const t = useTranslations("Bookings");
    const locale = useLocale();
    const dateLocale = locale === 'es' ? es : enUS;

    // Polling for real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, [router]);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [filterServiceId, setFilterServiceId] = useState<string>("all");

    // Filter bookings
    const filteredBookings = bookings.filter(b =>
        filterServiceId === "all" || b.service.id === filterServiceId
    );

    // Get days for grid
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    // Bookings for selected date
    const selectedDayBookings = filteredBookings.filter(b =>
        isSameDay(new Date(b.startTime), selectedDate)
    ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const handleDayClick = (day: Date) => {
        setSelectedDate(day);
        setIsDialogOpen(true);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Main Calendar Area */}
            <div className="flex-1 flex flex-col space-y-4">
                <div className="flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold capitalize">
                            {format(currentDate, "MMMM yyyy", { locale: dateLocale })}
                        </h2>
                        <div className="flex items-center rounded-md border border-input bg-transparent shadow-sm">
                            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 hover:bg-muted">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date())} className="h-8 px-2 text-xs font-normal hover:bg-muted">
                                {t('today')}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 hover:bg-muted">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="w-[200px]">
                        <Select value={filterServiceId} onValueChange={setFilterServiceId}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('filter')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('allServices')}</SelectItem>
                                {services.map(s => (
                                    <SelectItem key={s.id} value={s.id}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                                            {s.title}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex-1">
                    <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden border border-border shadow-sm min-h-0">
                        {Array.from({ length: 7 }).map((_, i) => (
                            // Start from Monday (1) to Sunday (0 in date-fns, but here we want formatted list)
                            // Or better, just map 0-6 if our keys match standard Monday start 
                            // Standard date-fns getDay returns 0 for Sunday. 
                            // Our keys in JSON are 0-6 (Sun-Sat).
                            // The calendar typically starts on Monday.
                            // So we need: 1(Mon), 2(Tue), ..., 6(Sat), 0(Sun).
                            <div key={i} className="p-2 text-center text-sm font-medium bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-muted-foreground sticky top-0 z-20 border-b">
                                {t(`weekDays.${(i + 1) % 7}`)}
                            </div>
                        ))}
                        {calendarDays.map((day, idx) => {
                            const dayBookings = filteredBookings.filter(b => isSameDay(new Date(b.startTime), day));
                            return (
                                <div
                                    key={day.toString()}
                                    onClick={() => handleDayClick(day)}
                                    className={cn(
                                        "min-h-[80px] md:min-h-[120px] p-1 md:p-2 bg-background hover:bg-accent/50 cursor-pointer transition-colors relative group border-t first:border-t-0",
                                        !isSameMonth(day, currentDate) && "text-muted-foreground bg-muted/20",
                                        isSameDay(day, selectedDate) && isDialogOpen && "bg-accent/50", // Highlight when dialog open
                                        isToday(day) && "bg-primary/5 font-semibold"
                                    )}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={cn(
                                            "text-xs md:text-sm w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full",
                                            isToday(day) && "bg-primary text-primary-foreground"
                                        )}>
                                            {format(day, "d")}
                                        </span>
                                        {dayBookings.length > 0 && (
                                            <Badge variant="secondary" className="hidden md:flex text-[10px] h-4 px-1">
                                                {dayBookings.length}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Mobile: Dots View */}
                                    <div className="flex md:hidden mt-1 gap-0.5 flex-wrap px-0.5">
                                        {dayBookings.map(booking => (
                                            <div
                                                key={booking.id}
                                                className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    booking.status === "CANCELLED" && "opacity-40"
                                                )}
                                                style={{ backgroundColor: booking.status === "CANCELLED" ? "#9ca3af" : booking.service.color }}
                                            />
                                        ))}
                                    </div>

                                    {/* Desktop: Bars View */}
                                    <div className="hidden md:block mt-1 space-y-1">
                                        {dayBookings.slice(0, 3).map(booking => (
                                            <div
                                                key={booking.id}
                                                className={cn(
                                                    "text-[10px] truncate px-1.5 py-0.5 rounded-sm bg-opacity-20 text-foreground",
                                                    booking.status === "CANCELLED" && "opacity-50 line-through text-muted-foreground bg-gray-100"
                                                )}
                                                style={{
                                                    backgroundColor: booking.status === "CANCELLED" ? undefined : `${booking.service.color}20`,
                                                    borderLeft: booking.status === "CANCELLED" ? "2px solid #9ca3af" : `2px solid ${booking.service.color}`
                                                }}
                                            >
                                                {format(booking.startTime, "HH:mm")}
                                            </div>
                                        ))}
                                        {dayBookings.length > 3 && (
                                            <div className="text-[10px] text-muted-foreground pl-1">
                                                {t('more', { count: dayBookings.length - 3 })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Dialog for Day Details */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 capitalize">
                            {format(selectedDate, "EEEE d", { locale: dateLocale })}
                            <span className="text-muted-foreground font-normal">
                                {format(selectedDate, "MMMM", { locale: dateLocale })}
                            </span>
                        </DialogTitle>
                        <DialogDescription>
                            {t('scheduled', { count: selectedDayBookings.length })}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                        {selectedDayBookings.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8 border rounded-lg border-dashed">
                                {t('noBookings')}
                            </div>
                        ) : (
                            selectedDayBookings.map(booking => (
                                <div key={booking.id} className="relative pl-4 py-1 group">
                                    <div
                                        className="absolute left-0 top-2 bottom-2 w-1 rounded-full"
                                        style={{ backgroundColor: booking.service.color }}
                                    />
                                    <div className="rounded-md border bg-card text-card-foreground shadow-sm p-3 hover:bg-accent transition-colors">
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge variant="outline" className="font-mono text-xs">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {format(booking.startTime, "HH:mm")} - {format(booking.endTime, "HH:mm")}
                                            </Badge>
                                            <Badge variant={booking.status === "CONFIRMED" ? "default" : "secondary"} className="text-[10px] py-0 h-5">
                                                {t(`status.${booking.status}` as any)}
                                            </Badge>
                                        </div>
                                        <h4 className="font-medium text-sm mb-1">{booking.clientName}</h4>
                                        <p className="text-xs text-muted-foreground mb-1">{booking.clientEmail}</p>

                                        {/* Show phone separately ONLY if it's NOT a phone booking (e.g. In Person but has phone) */}
                                        {booking.clientPhone && booking.service.locationType !== "PHONE" && (
                                            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                                <Phone className="w-3 h-3" />
                                                {booking.clientPhone}
                                            </p>
                                        )}

                                        <div className="pt-2 mt-2 border-t border-border/50">
                                            <p className="text-xs font-medium mb-1">{booking.service.title}</p>

                                            {/* Condensed Location/Contact Display */}
                                            <p className="text-xs text-muted-foreground flex items-start gap-1">
                                                {booking.service.locationType === "PHONE" ? (
                                                    <>
                                                        <Phone className="w-3 h-3 mt-0.5 shrink-0" />
                                                        <span>{booking.clientPhone || t('notProvided')}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="shrink-0">📍</span>
                                                        <span>
                                                            {booking.service.locationType === "IN_PERSON"
                                                                ? (booking.service.address || booking.service.user?.address || t('inPerson'))
                                                                : booking.service.locationType === "GOOGLE_MEET"
                                                                    ? "Google Meet"
                                                                    : t('online')
                                                            }
                                                        </span>
                                                    </>
                                                )}
                                            </p>
                                        </div>

                                        {booking.status !== "CANCELLED" && (
                                            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                                                <RescheduleDialog booking={booking as any} />
                                                <CancelBookingButton id={booking.id} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
