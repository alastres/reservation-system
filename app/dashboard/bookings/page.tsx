import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MotionDiv, staggerContainer, slideUp } from "@/components/ui/motion";
import { CalendarView } from "@/components/bookings/calendar-view";

export default async function BookingsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/auth/login");
    }

    const [bookings, services] = await Promise.all([
        prisma.booking.findMany({
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
        }),
        prisma.service.findMany({
            where: {
                userId: session.user.id
            },
            select: {
                id: true,
                title: true,
                color: true
            }
        })
    ]);

    return (
        <MotionDiv
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="flex-1 space-y-4 p-4 md:p-8 pt-6 flex flex-col"
        >
            <MotionDiv variants={slideUp} className="flex items-center justify-between space-y-2 flex-shrink-0">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                    Calendario
                </h2>
            </MotionDiv>

            <div className="flex-1 bg-card border rounded-xl shadow-sm p-2 md:p-4">
                <CalendarView bookings={bookings as any} services={services} />
            </div>
        </MotionDiv>
    );
}
