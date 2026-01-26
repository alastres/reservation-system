import { prisma } from "@/lib/prisma";
import { Users, CalendarCheck, Clock, TrendingUp } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { MonthlyBookingsChart } from "@/components/admin/monthly-bookings-chart";
import { InviteUserModal } from "@/components/admin/invite-user-modal";

export default async function AdminDashboardPage() {
    const userCount = await prisma.user.count();
    const bookingCount = await prisma.booking.count();
    const confirmedCount = await prisma.booking.count({
        where: { status: 'CONFIRMED' }
    });
    const t = await getTranslations("Admin.overview");
    const currentLocale = await getLocale();

    // Chart Data: Monthly Bookings for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // Go back 5 months + current = 6
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyBookings = await prisma.booking.findMany({
        where: {
            startTime: {
                gte: sixMonthsAgo
            }
        },
        select: {
            startTime: true
        },
        orderBy: {
            startTime: 'asc'
        }
    });

    // Process data
    const bookingsByMonth: Record<string, number> = {};

    // Initialize last 6 months with 0
    for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        const monthKey = d.toLocaleString('default', { month: 'short' });
        bookingsByMonth[monthKey] = 0;
        // Note: 'default' locale might result in mixed languages on server. 
        // Ideally pass locale, but for simplicity assuming server locale or 'en-US' formatted consistent keys.
        // Actually, let's use a fixed format or ISO for sorting if needed, but for display simple is okay.
        // Better implementation: Use 'en-US' for keys to ensure uniqueness/sorting or just array map.
    }

    // Since we want to display correct month names, let's just map the dates to the format.
    // However, to fill gaps we need a stable key.

    // Alternative: Generate the array of months first.
    const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        return {
            date: d,
            key: d.toISOString().slice(0, 7), // YYYY-MM
            label: d.toLocaleString(currentLocale, { month: 'short' }), // Localized label
        };
    });

    const chartDataMap = last6Months.reduce((acc, item) => {
        acc[item.key] = 0;
        return acc;
    }, {} as Record<string, number>);

    monthlyBookings.forEach(booking => {
        const key = booking.startTime.toISOString().slice(0, 7);
        if (chartDataMap[key] !== undefined) {
            chartDataMap[key]++;
        }
    });

    const chartData = last6Months.map(item => ({
        month: item.label,
        bookings: chartDataMap[item.key]
    }));


    // Active Today Implementation
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const endOfYesterday = new Date(endOfToday);
    endOfYesterday.setDate(endOfYesterday.getDate() - 1);

    const activeTodayCount = await prisma.booking.count({
        where: {
            startTime: {
                gte: startOfToday,
                lte: endOfToday
            }
        }
    });

    const activeYesterdayCount = await prisma.booking.count({
        where: {
            startTime: {
                gte: startOfYesterday,
                lte: endOfYesterday
            }
        }
    });

    const activeTrend = activeYesterdayCount === 0
        ? activeTodayCount > 0 ? "+100%" : "0%"
        : `${((activeTodayCount - activeYesterdayCount) / activeYesterdayCount * 100).toFixed(0)}%`;

    const activeTrendText = activeTodayCount >= activeYesterdayCount
        ? `+${activeTrend} vs ${t("stats.yesterday") || "yesterday"}`
        : `${activeTrend} vs ${t("stats.yesterday") || "yesterday"}`;

    const stats = [
        {
            title: t("stats.totalUsers"),
            value: userCount,
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            trend: "+12% this month" // Placeholder for now
        },
        {
            title: t("stats.totalBookings"),
            value: bookingCount,
            icon: Clock,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            trend: "+5% this month"
        },
        {
            title: t("stats.confirmed"),
            value: confirmedCount,
            icon: CalendarCheck,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            trend: "98% completion rate"
        },
        {
            title: t("stats.activeToday"),
            value: activeTodayCount,
            icon: TrendingUp,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            trend: activeTrendText
        }
    ];

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">{t("title")}</h2>
                <p className="text-muted-foreground">{t("subtitle")}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <div
                        key={stat.title}
                        className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-colors group"
                    >
                        <div className="flex items-center justify-between pb-2">
                            <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            <p className="text-xs text-muted-foreground">{stat.trend}</p>
                        </div>

                        {/* Decorative glow - visible in dark mode primarily or subtle in light */}
                        <div className={`absolute -right-6 -bottom-6 h-24 w-24 rounded-full ${stat.bg} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
                    </div>
                ))}
            </div>

            {/* Chart Section */}
            <div className="grid gap-6 md:grid-cols-7">
                <div className="col-span-4 rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h3 className="text-lg font-medium text-foreground mb-4">{t("recentActivity")}</h3>
                    <div className="h-[300px] w-full">
                        <MonthlyBookingsChart data={chartData} />
                    </div>
                </div>
                <div className="col-span-3 rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h3 className="text-lg font-medium text-foreground mb-4">{t("quickActions")}</h3>
                    <div className="space-y-4">
                        <InviteUserModal />
                        {/* More quick actions... */}
                    </div>
                </div>
            </div>
        </div>
    );
}
