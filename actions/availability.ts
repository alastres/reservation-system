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

import { getTranslations } from "next-intl/server";

export const saveAvailability = async (rules: z.infer<typeof AvailabilitySchema>) => {
    const session = await auth();
    const t = await getTranslations("Errors");
    const tSuccess = await getTranslations("Success");
    if (!session?.user?.id) return { error: t("unauthorized") };

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
        return { success: tSuccess("availabilitySaved") };
    } catch {
        return { error: t("availabilitySaveFailed") };
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
    const t = await getTranslations("Errors");
    const tSuccess = await getTranslations("Success");
    if (!session?.user?.id) return { error: t("unauthorized") };

    try {
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
        return { success: tSuccess("exceptionSaved") };
    } catch (e) {
        console.error(e);
        return { error: t("exceptionSaveFailed") };
    }
};

export const deleteException = async (exceptionId: string) => {
    const session = await auth();
    const t = await getTranslations("Errors");
    const tSuccess = await getTranslations("Success");
    if (!session?.user?.id) return { error: t("unauthorized") };

    try {
        await prisma.availabilityException.delete({
            where: {
                id: exceptionId,
                userId: session.user.id // Security check
            }
        });
        revalidatePath("/dashboard/availability");
        return { success: tSuccess("exceptionRemoved") };
    } catch {
        return { error: t("exceptionDeleteFailed") };
    }
};
