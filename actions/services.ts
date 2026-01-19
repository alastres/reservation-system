"use server";

import * as z from "zod";
import { ServiceSchema } from "@/schemas";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const createService = async (values: z.infer<typeof ServiceSchema>) => {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const validated = ServiceSchema.safeParse(values);
    if (!validated.success) return { error: "Invalid fields" };

    try {
        const service = await prisma.service.create({
            data: {
                ...validated.data,
                userId: session.user.id
            },
            include: { user: { select: { username: true } } }
        });
        revalidatePath("/dashboard/services");
        return { success: `Service "${service.title}" created`, service };
    } catch (e) {
        console.error(e); // Debugging
        return { error: "Something went wrong" };
    }
}

export const getServices = async () => {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        const services = await prisma.service.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            include: { user: { select: { username: true } } }
        });
        return services;
    } catch {
        return [];
    }
}

export const deleteService = async (serviceId: string) => {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const service = await prisma.service.delete({
            where: {
                id: serviceId,
                userId: session.user.id
            }
        });
        revalidatePath("/dashboard/services");
        return { success: `Service "${service.title}" deleted` };
    } catch {
        return { error: "Failed to delete service" };
    }
}

export const updateService = async (serviceId: string, values: z.infer<typeof ServiceSchema>) => {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const validated = ServiceSchema.safeParse(values);
    if (!validated.success) return { error: "Invalid fields" };

    try {
        const service = await prisma.service.update({
            where: {
                id: serviceId,
                userId: session.user.id
            },
            data: {
                ...validated.data
            },
            include: { user: { select: { username: true } } }
        });
        revalidatePath("/dashboard/services");
        revalidatePath(`/dashboard/services/${serviceId}`);
        return { success: `Service "${service.title}" updated`, service };
    } catch {
        return { error: "Failed to update service" };
    }
}

export const duplicateService = async (serviceId: string) => {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const existingService = await prisma.service.findUnique({
            where: {
                id: serviceId,
                userId: session.user.id
            }
        });

        if (!existingService) return { error: "Service not found" };

        // Create new slug
        let newUrl = `${existingService.url}-copy`;
        let counter = 1;
        while (await prisma.service.findFirst({
            where: {
                userId: session.user.id,
                url: newUrl
            }
        })) {
            newUrl = `${existingService.url}-copy-${counter}`;
            counter++;
        }

        const newService = await prisma.service.create({
            data: {
                title: `${existingService.title} (Copy)`,
                description: existingService.description,
                duration: existingService.duration,
                price: existingService.price,
                location: existingService.location,
                url: newUrl,
                color: existingService.color,
                capacity: existingService.capacity,
                bufferTime: existingService.bufferTime,
                minNotice: existingService.minNotice,
                isActive: false, // Default to draft
                userId: session.user.id,
                customInputs: existingService.customInputs ?? [],
                isRecurrenceEnabled: existingService.isRecurrenceEnabled,
                maxRecurrenceCount: existingService.maxRecurrenceCount
            },
            include: { user: { select: { username: true } } }
        });

        revalidatePath("/dashboard/services");
        return { success: `Service "${existingService.title}" duplicated`, service: newService };
    } catch {
        return { error: "Failed to duplicate service" };
    }
}

export const toggleServiceStatus = async (serviceId: string, isActive: boolean) => {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const service = await prisma.service.update({
            where: {
                id: serviceId,
                userId: session.user.id
            },
            data: { isActive }
        });
        revalidatePath("/dashboard/services");
        return { success: `Service "${service.title}" is now ${isActive ? 'active' : 'inactive'}` };
    } catch {
        return { error: "Failed to update status" };
    }
}
