"use client";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { useTranslations } from "next-intl";

interface BookingsChartProps {
    data: {
        service: string;
        bookings: number;
    }[];
}

const COLORS = [
    "#8b5cf6", // Violet 500
    "#ec4899", // Pink 500
    "#06b6d4", // Cyan 500
    "#10b981", // Emerald 500
    "#f59e0b", // Amber 500
];

export function BookingsChart({ data }: BookingsChartProps) {
    const t = useTranslations('DashboardOverview');

    return (
        <ResponsiveContainer width="100%" height={350}>
<<<<<<< HEAD
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
=======
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                    dataKey="service"
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
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                    }}
                    formatter={(value: any) => [value, "Bookings"]}
                />
                <Bar
>>>>>>> master
                    dataKey="bookings"
                    nameKey="service"
                    stroke="hsl(var(--card))"
                    strokeWidth={2}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="rounded-lg border bg-popover p-2 shadow-sm">
                                    <div className="flex flex-col">
                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                            {payload[0].name}
                                        </span>
                                        <span className="font-bold text-popover-foreground">
                                            {payload[0].value} {t('bookings')}
                                        </span>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => (
                        <span className="text-sm text-muted-foreground capitalize">{value}</span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}

