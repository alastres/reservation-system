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
import { getTranslations } from "next-intl/server";

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

    const activeServices = await prisma.service.count({
        where: {
            userId: userId,
            isActive: true,
        },
    });

    const revenue = bookings.reduce((acc: number, booking: any) => acc + (booking.amountPaid || 0), 0);

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
        acc[date] += (booking.amountPaid || 0);
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
        activeServices,
    };
}

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/auth/login");
    }

    const sections = await getDashboardStats(session.user.id);
    const t = await getTranslations('DashboardOverview');

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
                    {t('title')}
                </h2>
            </MotionDiv>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MotionDiv variants={fadeIn}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('totalRevenue')}
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${sections.revenue.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground border-l-2 border-emerald-500 pl-2 mt-1">
                                <span className="text-emerald-500 font-medium font-mono">{t('lifetime')}</span>
                            </p>
                        </CardContent>
                    </Card>
                </MotionDiv>
                <MotionDiv variants={fadeIn}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('totalBookings')}
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{sections.totalBookings}</div>
                            <p className="text-xs text-muted-foreground border-l-2 border-primary pl-2 mt-1">
                                <span className="text-primary font-medium font-mono">{t('allTime')}</span>
                            </p>
                        </CardContent>
                    </Card>
                </MotionDiv>
                <MotionDiv variants={fadeIn}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('upcomingBookings')}
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{sections.upcomingBookings}</div>
                            <p className="text-xs text-muted-foreground border-l-2 border-purple-500 pl-2 mt-1">
                                <span className="text-purple-500 font-medium font-mono">{t('scheduled')}</span>
                            </p>
                        </CardContent>
                    </Card>
                </MotionDiv>
                <MotionDiv variants={fadeIn}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('services')}
                            </CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{sections.activeServices}</div>
                            <p className="text-xs text-muted-foreground border-l-2 border-indigo-500 pl-2 mt-1">
                                <span className="text-indigo-500 font-medium font-mono">{t('active')}</span>
                            </p>
                        </CardContent>
                    </Card>
                </MotionDiv>
            </div>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                <MotionDiv variants={fadeIn} className="lg:col-span-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('revenueOverview')}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {t('last30Days')}
                            </p>
                        </CardHeader>
                        <CardContent className="pl-2">
                            {sections.revenueChartData.length > 0 ? (
                                <RevenueChart data={sections.revenueChartData} />
                            ) : (
                                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                                    {t('noRevenueData')}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </MotionDiv>
                <MotionDiv variants={fadeIn} className="lg:col-span-3">
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>{t('recentBookings')}</CardTitle>
                            <div className="text-sm text-muted-foreground">
                                {t('latestBookingActivity')}
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
                            <CardTitle>{t('bookingsByService')}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {t('top5Services')}
                            </p>
                        </CardHeader>
                        <CardContent className="pl-2">
                            {sections.bookingsChartData.length > 0 ? (
                                <BookingsChart data={sections.bookingsChartData} />
                            ) : (
                                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                                    {t('noBookingData')}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </MotionDiv>
            </div>
        </MotionDiv>
    );
}
