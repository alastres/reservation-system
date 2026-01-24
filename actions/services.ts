"use server";

import * as z from "zod";
import { ServiceSchema } from "@/schemas";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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
                revalidate: 60 // 1 minute cache for dashboard usually fine, or rely on tags
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
        const { userId: _, ...data } = validatedFields.data; // Extract customInputs and omit userId

        const service = await prisma.service.create({
            data: {
                userId: session.user.id,
                ...data,
                customInputs: data.customInputs as any
            },
            include: { user: { select: { username: true } } }
        });

        revalidatePath("/dashboard/services");
        // revalidatePath(`/${session.user.username}`);
        return { success: tSuccess("created", { name: service.title }), service };
    } catch (e: any) {
        console.log(e);
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
        const service = await prisma.service.update({
            where: { id, userId: session.user.id },
            data: { ...data, customInputs: data.customInputs as any },
            include: { user: { select: { username: true } } }
        });

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
        const service = await prisma.service.delete({
            where: { id, userId: session.user.id }
        });

        revalidatePath("/dashboard/services");
        return { success: tSuccess("deleted", { name: service.title }) };
    } catch {
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

        // Create new slug
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
                isActive: false, // Default to draft
                customInputs: data.customInputs as any
            },
            include: { user: { select: { username: true } } }
        });

        revalidatePath("/dashboard/services");
        return { success: tSuccess("duplicated"), service: newService };
    } catch (e) {
        console.log(e)
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

        revalidatePath("/dashboard/services");
        return { success: tSuccess("toggled") };
    } catch {
        return { error: t("failedUpdate") };
    }
}
