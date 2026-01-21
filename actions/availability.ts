"use server";

import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

// Simple schema for passing data
const AvailabilitySchema = z.array(z.object({
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string(), // "09:00"
    endTime: z.string(),   // "17:00"
}));

export const saveAvailability = async (rules: z.infer<typeof AvailabilitySchema>) => {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const userId = session.user.id;

    try {
        // Transaction: Delete old rules, create new ones
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            await tx.availabilityRule.deleteMany({
                where: { userId }
            });

            if (rules.length > 0) {
                await tx.availabilityRule.createMany({
                    data: rules.map(rule => ({
                        userId,
                        ...rule
                    }))
                });
            }
        });

        revalidatePath("/dashboard/availability");
        return { success: "Availability saved" };
    } catch {
        return { error: "Failed to save availability" };
    }
};

export const getAvailability = async () => {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        const rules = await prisma.availabilityRule.findMany({
            where: { userId: session.user.id },
            orderBy: { dayOfWeek: "asc" }
        });
        return rules;
    } catch {
        return [];
        return [];
    }
};

export const getExceptions = async () => {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        const exceptions = await prisma.availabilityException.findMany({
            where: { userId: session.user.id },
            orderBy: { date: "asc" }
        });
        return exceptions;
    } catch {
        return [];
    }
};

export const saveException = async (date: Date, isAvailable: boolean, startTime?: string, endTime?: string) => {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        // Upsert logic based on date + userId
        // Since Prisma doesn't support composite unique on date (it's DateTime), we might need findFirst
        // But date is unique for a user effectively. 
        // Ideally we should have a unique index on [userId, date] in schema. 
        // Let's check schema... assuming we treat it as unique per day.

        // Simplified: Check if exists, update or create.

        const existing = await prisma.availabilityException.findFirst({
            where: {
                userId: session.user.id,
                date: date
            }
        });

        if (existing) {
            await prisma.availabilityException.update({
                where: { id: existing.id },
                data: { isAvailable, startTime, endTime }
            });
        } else {
            await prisma.availabilityException.create({
                data: {
                    userId: session.user.id,
                    date,
                    isAvailable,
                    startTime,
                    endTime
                }
            });
        }

        revalidatePath("/dashboard/availability");
        return { success: "Exception saved" };
    } catch (e) {
        console.error(e);
        return { error: "Failed to save exception" };
    }
};

export const deleteException = async (exceptionId: string) => {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        await prisma.availabilityException.delete({
            where: {
                id: exceptionId,
                userId: session.user.id // Security check
            }
        });
        revalidatePath("/dashboard/availability");
        return { success: "Exception removed" };
    } catch {
        return { error: "Failed to remove exception" };
    }
};
