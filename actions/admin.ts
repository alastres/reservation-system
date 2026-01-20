"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const updateUserRole = async (userId: string, newRole: Role) => {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== Role.ADMIN) {
            return { error: "Unauthorized" };
        }

        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole },
        });

        // Log the action
        await prisma.systemLog.create({
            data: {
                action: "UPDATE_ROLE",
                details: `Updated user ${userId} to ${newRole}`,
                userId: session.user.id,
            }
        });

        revalidatePath("/admin/users");
        return { success: "User role updated successfully" };
    } catch (error) {
        return { error: "Failed to update role" };
    }
};

export const deleteUser = async (userId: string) => {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== Role.ADMIN) {
            return { error: "Unauthorized" };
        }

        await prisma.user.delete({
            where: { id: userId },
        });

        // Log the action
        await prisma.systemLog.create({
            data: {
                action: "DELETE_USER",
                details: `Deleted user ${userId}`,
                userId: session.user.id,
            }
        });

        revalidatePath("/admin/users");
        return { success: "User deleted successfully" };
    } catch (error) {
        return { error: "Failed to delete user" };
    }
};
