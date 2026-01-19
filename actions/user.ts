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
    notificationPreferences: z.object({
        email: z.boolean().optional(),
        sms: z.boolean().optional(),
    }).optional(),
});

export async function updateProfile(data: z.infer<typeof profileSchema>) {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const validated = profileSchema.safeParse(data);

    if (!validated.success) {
        return { error: "Invalid input fields" };
    }

    const { name, username, bio, timeZone, image, notificationPreferences } = validated.data;

    // Check username uniqueness if changing
    if (username) {
        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser && existingUser.id !== session.user.id) {
            return { error: "Username is already taken" };
        }
    }

    try {
        console.log("Updating user in DB:", session.user.id, {
            name, username, timeZone: timeZone || "UTC", image
        });

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
                notificationPreferences: notificationPreferences || undefined,
            },
        });

        console.log("User updated successfully:", updatedUser);

        revalidatePath("/dashboard/settings");
        revalidatePath("/dashboard");
        return { success: "Profile updated successfully" };
    } catch (error) {
        console.error("Profile update error:", error);
        return { error: "Failed to update profile" };
    }
}
