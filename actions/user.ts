"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    username: z.string().min(3, "Username must be at least 3 characters").optional().or(z.literal("")),
    bio: z.string().optional(),
    timeZone: z.string().optional(),
    language: z.string().optional(),
    image: z.string().optional().or(z.literal("")),
    coverImage: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    notificationPreferences: z.object({
        email: z.boolean().optional(),
        sms: z.boolean().optional(),
    }).optional(),
    maxConcurrentClients: z.number().int().min(1).optional(),
});

import { getTranslations } from "next-intl/server";

export async function updateProfile(data: z.infer<typeof profileSchema>) {
    const session = await auth();
    const t = await getTranslations("Profile");

    if (!session?.user?.id) {
        return { error: t("unauthorized") };
    }

    const validated = profileSchema.safeParse(data);

    if (!validated.success) {
        return { error: t("invalidInput") };
    }

    const { name, username, bio, timeZone, image, address, phone, notificationPreferences, maxConcurrentClients } = validated.data;

    // Fetch current user to check plan
    const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { subscriptionPlan: true, role: true }
    });
    const isFree = !currentUser?.subscriptionPlan || currentUser.subscriptionPlan === "FREE" as any;
    const isAdmin = currentUser?.role === "ADMIN";

    // Enforce Free plan restriction on global capacity
    const effectiveMaxConcurrentClients = (isFree && !isAdmin) ? 1 : maxConcurrentClients;

    // Check username uniqueness if changing
    if (username) {
        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser && existingUser.id !== session.user.id) {
            return { error: t("usernameTaken") };
        }
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name,
                username,
                bio,
                timeZone: timeZone || "UTC",
                language: validated.data.language || "es",
                image,
                coverImage: validated.data.coverImage,
                address,
                phone,
                notificationPreferences: notificationPreferences || undefined,
                maxConcurrentClients: effectiveMaxConcurrentClients || undefined,
            },
        });

        revalidatePath("/dashboard/settings");
        revalidatePath("/dashboard");
        return { success: t("updateSuccess") };
    } catch (error) {
        console.error("Profile update error:", error);
        return { error: t("updateFailed") };
    }
}

export const getUserPlan = async () => {
    const session = await auth();
    if (!session?.user?.id) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { subscriptionPlan: true, role: true, username: true }
    });

    return { plan: user?.subscriptionPlan, role: user?.role, username: user?.username };
}
