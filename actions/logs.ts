"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type LogFilter = "ALL" | "CLIENT_CONFIRMATION" | "BOOKING_RECEIVED" | "CLIENT_CANCELLATION" | "REMINDER_24H" | "REMINDER_1H" | "CLIENT_RESCHEDULE";

export async function getNotificationLogs(
    page: number = 1,
    limit: number = 20,
    filter: LogFilter = "ALL"
) {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const userId = session.user.id;
    const skip = (page - 1) * limit;

    try {
        const whereClause: any = { userId };

        if (filter !== "ALL") {
            whereClause.type = filter;
        }

        const [logs, total] = await Promise.all([
            prisma.notificationLog.findMany({
                where: whereClause,
                orderBy: { createdAt: "desc" },
                take: limit,
                skip: skip,
            }),
            prisma.notificationLog.count({ where: whereClause }),
        ]);

        return {
            logs,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                current: page,
                limit
            }
        };

    } catch (error) {
        console.error("Failed to fetch logs:", error);
        return { error: "Failed to fetch logs" };
    }
}
