"use server";

import * as z from "zod";
import { ServiceSchema } from "@/schemas";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";

import { getTranslations } from "next-intl/server";

import { unstable_cache } from "next/cache";

export const getServices = async () => {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        const getCachedServices = unstable_cache(
            async (userId) => {
                return await prisma.service.findMany({
                    where: { userId },
                    orderBy: { createdAt: "desc" },
                    include: { user: { select: { username: true } } }
                });
            },
            [`services-${session.user.id}`],
            {
                tags: [`services-${session.user.id}`],
                revalidate: 60
            }
        );

        return await getCachedServices(session.user.id);
    } catch {
        return [];
    }
}

export const createService = async (values: z.infer<typeof ServiceSchema>) => {
    const session = await auth();
    const t = await getTranslations("Errors");
    const tSuccess = await getTranslations("Services.status");
    if (!session?.user?.id) return { error: t("unauthorized") };

    const validatedFields = ServiceSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: t("invalidFields") };
    }

    try {
        const { userId: _, ...data } = validatedFields.data;

        const service = await prisma.service.create({
            data: {
                userId: session.user.id,
                ...data,
                customInputs: data.customInputs as any
            },
            include: { user: { select: { username: true } } }
        });

        revalidateTag(`services-${session.user.id}`, 'default');
        revalidateTag(`user-profile-${session.user.username}`, 'default');
        revalidatePath("/dashboard/services");
        return { success: tSuccess("created", { name: service.title }), service };
    } catch (e: any) {
        console.error("Create Service Error:", e);
        return { error: t("somethingWentWrong") };
    }
}

export const updateService = async (id: string, values: z.infer<typeof ServiceSchema>) => {
    const session = await auth();
    const t = await getTranslations("Errors");
    const tSuccess = await getTranslations("Services.status");
    if (!session?.user?.id) return { error: t("unauthorized") };

    const validatedFields = ServiceSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: t("invalidFields") };
    }

    try {
        const { userId: _, ...data } = validatedFields.data;

        // Check plan limits for update
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { subscriptionPlan: true, role: true }
        });
        const isFree = !user?.subscriptionPlan || user.subscriptionPlan === "FREE";
        const isAdmin = user?.role === "ADMIN";

        if (isFree && !isAdmin) {
            data.price = 0;
            data.requiresPayment = false;
            data.maxConcurrency = 1;
            data.isConcurrencyEnabled = false;
        }

        const service = await prisma.service.update({
            where: { id, userId: session.user.id },
            data: { ...data, customInputs: data.customInputs as any },
            include: { user: { select: { username: true } } }
        });

        revalidateTag(`services-${session.user.id}`, 'default');
        revalidateTag(`user-profile-${session.user.username}`, 'default');
        revalidatePath("/dashboard/services");
        return { success: tSuccess("updated", { name: service.title }), service };
    } catch {
        return { error: t("failedUpdate") };
    }
}

export const deleteService = async (id: string) => {
    const session = await auth();
    const t = await getTranslations("Errors");
    const tSuccess = await getTranslations("Services.status");
    if (!session?.user?.id) return { error: t("unauthorized") };

    try {
        const { count } = await prisma.service.deleteMany({
            where: { id, userId: session.user.id }
        });

        if (count === 0) {
            return { error: t("serviceNotFound") };
        }

        revalidateTag(`services-${session.user.id}`, 'default');
        revalidateTag(`user-profile-${session.user.username}`, 'default');
        revalidatePath("/dashboard/services");
        return { success: tSuccess("deleted", { name: "Service" }) };
    } catch (e) {
        console.error("Delete Service Error:", e);
        return { error: t("failedDelete") };
    }
}

export const duplicateService = async (id: string) => {
    const session = await auth();
    const t = await getTranslations("Errors");
    const tSuccess = await getTranslations("Services.status");
    if (!session?.user?.id) return { error: t("unauthorized") };

    try {
        const service = await prisma.service.findUnique({
            where: { id, userId: session.user.id }
        });

        if (!service) return { error: t("serviceNotFound") };

        const { id: _, createdAt, updatedAt, ...data } = service;

        let newUrl = `${data.url}-copy`;
        let counter = 1;
        while (await prisma.service.findFirst({
            where: {
                userId: session.user.id,
                url: newUrl
            }
        })) {
            newUrl = `${data.url}-copy-${counter}`;
            counter++;
        }

        const newService = await prisma.service.create({
            data: {
                ...data,
                title: `${data.title} (Copy)`,
                url: newUrl,
                isActive: false,
                customInputs: data.customInputs as any
            },
            include: { user: { select: { username: true } } }
        });

        revalidateTag(`services-${session.user.id}`, 'default');
        revalidateTag(`user-profile-${session.user.username}`, 'default');
        revalidatePath("/dashboard/services");
        return { success: tSuccess("duplicated"), service: newService };
    } catch (e: any) {
        console.error("Duplicate Service Error:", e);
        return { error: t("somethingWentWrong") };
    }
}

export const toggleServiceStatus = async (id: string, isActive: boolean) => {
    const session = await auth();
    const t = await getTranslations("Errors");
    const tSuccess = await getTranslations("Services.status");
    if (!session?.user?.id) return { error: t("unauthorized") };

    try {
        await prisma.service.update({
            where: { id, userId: session.user.id },
            data: { isActive }
        });

        revalidateTag(`services-${session.user.id}`, 'default');
        revalidateTag(`user-profile-${session.user.username}`, 'default');
        revalidatePath("/dashboard/services");
        return { success: tSuccess("toggled") };
    } catch {
        return { error: t("failedUpdate") };
    }
}
