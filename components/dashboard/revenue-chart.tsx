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

interface RevenueChartProps {
    data: {
        date: string;
        revenue: number;
    }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
    const t = useTranslations('DashboardOverview');

    // Calculate trend
    const isPositiveTrend = data.length > 1
        ? data[data.length - 1].revenue >= data[0].revenue
        : true;

    const color = isPositiveTrend ? "#10b981" : "#f43f5e"; // Emerald-500 vs Rose-500

    return (
        <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                />
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" vertical={false} />
                <Tooltip
                    content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="rounded-lg border bg-popover p-2 shadow-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col">
                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                {label}
                                            </span>
                                            <span className="font-bold text-popover-foreground">
                                                ${Number(payload[0].value).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={color}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    strokeWidth={2}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

