import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

type Booking = {
    id: string;
    clientName: string;
    clientEmail: string;
    startTime: Date;
    service: {
        title: string;
        price: number;
    };
    status: string;
};

export function RecentBookings({ bookings }: { bookings: Booking[] }) {
    if (bookings.length === 0) {
        return <div className="text-sm text-muted-foreground">No recent bookings.</div>;
    }

    return (
        <div className="space-y-8">
            {bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://avatar.vercel.sh/${booking.clientEmail}`} alt="Avatar" />
                        <AvatarFallback>{booking.clientName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{booking.clientName}</p>
                        <p className="text-xs text-muted-foreground">
                            {booking.service.title} • {format(new Date(booking.startTime), "MMM d, HH:mm")}
                        </p>
                    </div>
                    <div className="ml-auto font-medium">
                        {booking.status === "CONFIRMED" ? (
                            <span className="text-emerald-500 text-xs">Confirmed</span>
                        ) : (
                            <span className="text-muted-foreground text-xs">{booking.status}</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
