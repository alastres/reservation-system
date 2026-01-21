import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CreditCard, Users, Activity, DollarSign } from "lucide-react";
import { redirect } from "next/navigation";
import { MotionDiv, staggerContainer, fadeIn, slideUp } from "@/components/ui/motion";

import { RecentBookings } from "@/components/dashboard/recent-bookings";
import { DashboardAutoRefresh } from "@/components/dashboard/auto-refresh";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { BookingsChart } from "@/components/dashboard/bookings-chart";

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
        orderBy: {
            startTime: 'asc'
        }
    });

    const revenue = bookings.reduce((acc: number, booking: any) => acc + booking.service.price, 0);

    // Chart Data: Revenue over last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentBookingsForChart = bookings.filter(
        (booking: any) => new Date(booking.startTime) >= thirtyDaysAgo
    );

    // Aggregate revenue by date
    const revenueByDate = recentBookingsForChart.reduce((acc: any, booking: any) => {
        const date = new Date(booking.startTime).toISOString().split('T')[0];
        if (!acc[date]) {
            acc[date] = 0;
        }
        acc[date] += booking.service.price;
        return acc;
    }, {});

    const revenueChartData = Object.entries(revenueByDate).map(([date, revenue]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: revenue as number,
    }));

    // Chart Data: Bookings by service
    const bookingsByService = bookings.reduce((acc: any, booking: any) => {
        const serviceName = booking.service.title;
        if (!acc[serviceName]) {
            acc[serviceName] = 0;
        }
        acc[serviceName]++;
        return acc;
    }, {});

    const bookingsChartData = Object.entries(bookingsByService)
        .map(([service, count]) => ({
            service: service.length > 15 ? service.substring(0, 15) + '...' : service,
            bookings: count as number,
        }))
        .slice(0, 5); // Top 5 services

    return {
        totalBookings,
        upcomingBookings,
        revenue,
        recentBookings,
        revenueChartData,
        bookingsChartData,
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
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                <MotionDiv variants={fadeIn} className="lg:col-span-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Overview</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Last 30 days revenue trend
                            </p>
                        </CardHeader>
                        <CardContent className="pl-2">
                            {sections.revenueChartData.length > 0 ? (
                                <RevenueChart data={sections.revenueChartData} />
                            ) : (
                                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                                    No revenue data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </MotionDiv>
                <MotionDiv variants={fadeIn} className="lg:col-span-3">
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
            <div className="grid gap-4 grid-cols-1">
                <MotionDiv variants={fadeIn}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Bookings by Service</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Top 5 services by booking count
                            </p>
                        </CardHeader>
                        <CardContent className="pl-2">
                            {sections.bookingsChartData.length > 0 ? (
                                <BookingsChart data={sections.bookingsChartData} />
                            ) : (
                                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                                    No booking data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </MotionDiv>
            </div>
        </MotionDiv>
    );
}
