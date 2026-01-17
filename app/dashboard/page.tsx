import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CreditCard, Users, Activity, DollarSign } from "lucide-react";
import { redirect } from "next/navigation";
import { MotionDiv, staggerContainer, fadeIn, slideUp } from "@/components/ui/motion";

import { RecentBookings } from "@/components/dashboard/recent-bookings";
import { DashboardAutoRefresh } from "@/components/dashboard/auto-refresh";

async function getDashboardStats(userId: string) {
    const totalBookings = await prisma.booking.count({
        where: {
            service: {
                userId: userId,
            },
        },
    });

    const upcomingBookings = await prisma.booking.count({
        where: {
            service: {
                userId: userId,
            },
            startTime: {
                gt: new Date(),
            },
            status: "CONFIRMED",
        },
    });

    // Get recent bookings for the list
    const recentBookings = await prisma.booking.findMany({
        where: {
            service: {
                userId: userId,
            },
        },
        include: {
            service: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: 5
    });

    // Calculate revenue from all confirmed bookings
    const bookings = await prisma.booking.findMany({
        where: {
            service: {
                userId: userId,
            },
            status: "CONFIRMED",
        },
        include: {
            service: true,
        },
    });

    const revenue = bookings.reduce((acc: number, booking: any) => acc + booking.service.price, 0);

    return {
        totalBookings,
        upcomingBookings,
        revenue,
        recentBookings
    };
}

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/auth/login");
    }

    const sections = await getDashboardStats(session.user.id);

    return (
        <MotionDiv
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="flex-1 space-y-4 p-8 pt-6"
        >
            <DashboardAutoRefresh />
            <MotionDiv variants={slideUp} className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                    Dashboard
                </h2>
            </MotionDiv>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MotionDiv variants={fadeIn}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Revenue
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${sections.revenue.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground border-l-2 border-emerald-500 pl-2 mt-1">
                                <span className="text-emerald-500 font-medium font-mono">Lifetime</span>
                            </p>
                        </CardContent>
                    </Card>
                </MotionDiv>
                <MotionDiv variants={fadeIn}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Bookings
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{sections.totalBookings}</div>
                            <p className="text-xs text-muted-foreground border-l-2 border-primary pl-2 mt-1">
                                <span className="text-primary font-medium font-mono">All time</span>
                            </p>
                        </CardContent>
                    </Card>
                </MotionDiv>
                <MotionDiv variants={fadeIn}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Upcoming Bookings
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{sections.upcomingBookings}</div>
                            <p className="text-xs text-muted-foreground border-l-2 border-purple-500 pl-2 mt-1">
                                <span className="text-purple-500 font-medium font-mono">Scheduled</span>
                            </p>
                        </CardContent>
                    </Card>
                </MotionDiv>
                <MotionDiv variants={fadeIn}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Services
                            </CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">--</div>
                            <p className="text-xs text-muted-foreground border-l-2 border-indigo-500 pl-2 mt-1">
                                <span className="text-indigo-500 font-medium font-mono">Active</span>
                            </p>
                        </CardContent>
                    </Card>
                </MotionDiv>
            </div>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
                <MotionDiv variants={fadeIn} className="col-span-4">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                                Graph Placeholder
                            </div>
                        </CardContent>
                    </Card>
                </MotionDiv>
                <MotionDiv variants={fadeIn} className="col-span-3">
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Recent Bookings</CardTitle>
                            <div className="text-sm text-muted-foreground">
                                Latest booking activity.
                            </div>
                        </CardHeader>
                        <CardContent>
                            <RecentBookings bookings={sections.recentBookings} />
                        </CardContent>
                    </Card>
                </MotionDiv>
            </div>
        </MotionDiv>
    );
}
