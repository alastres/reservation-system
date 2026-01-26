"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useTranslations } from "next-intl";

interface MonthlyBookingsChartProps {
    data: {
        month: string;
        bookings: number;
    }[];
}

export function MonthlyBookingsChart({ data }: MonthlyBookingsChartProps) {
    const t = useTranslations('DashboardOverview');

    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" vertical={false} />
                <XAxis
                    dataKey="month"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                />
                <Tooltip
                    cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 2, strokeDasharray: "5 5" }}
                    contentStyle={{
                        backgroundColor: "hsl(var(--background)/0.8)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        color: "hsl(var(--foreground))"
                    }}
                    itemStyle={{ color: "hsl(var(--primary))" }}
                    formatter={(value: number | undefined) => [value || 0, t('bookings')]}
                />
                <Area
                    type="monotone"
                    dataKey="bookings"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorBookings)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: "hsl(var(--primary))" }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

