import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { CancelBookingButton } from "@/components/bookings/booking-action";
import { Badge } from "@/components/ui/badge";
import { MotionDiv, staggerContainer, fadeIn, slideUp } from "@/components/ui/motion";

export default async function BookingsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/auth/login");
    }

    const bookings = await prisma.booking.findMany({
        where: {
            service: {
                userId: session.user.id,
            },
        },
        include: {
            service: true,
        },
        orderBy: {
            startTime: "desc",
        },
    });

    return (
        <MotionDiv
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="flex-1 space-y-4 p-8 pt-6"
        >
            <MotionDiv variants={slideUp} className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                    Bookings
                </h2>
            </MotionDiv>

            <div className="grid gap-4">
                {bookings.length === 0 ? (
                    <MotionDiv variants={fadeIn}>
                        <Card className="bg-muted/10 border-white/5">
                            <CardContent className="h-32 flex items-center justify-center text-muted-foreground">
                                No bookings found.
                            </CardContent>
                        </Card>
                    </MotionDiv>
                ) : (
                    bookings.map((booking: any) => (
                        <MotionDiv key={booking.id} variants={fadeIn}>
                            <Card className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4 hover:bg-white/5 transition-colors duration-200">
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-lg">{booking.service.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {format(booking.startTime, "MMMM d, yyyy")} • {format(booking.startTime, "h:mm a")} - {format(booking.endTime, "h:mm a")}
                                    </p>
                                    <p className="text-sm">
                                        Client: <span className="font-medium text-primary">{booking.clientName}</span> ({booking.clientEmail})
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant={booking.status === "CONFIRMED" ? "default" : "secondary"} className={booking.status === "CONFIRMED" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : ""}>
                                        {booking.status}
                                    </Badge>
                                    {booking.status === "CONFIRMED" && (
                                        <CancelBookingButton id={booking.id} />
                                    )}
                                </div>
                            </Card>
                        </MotionDiv>
                    ))
                )}
            </div>
        </MotionDiv>
    );
}
