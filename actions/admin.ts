"use server";

import { sendInvitationEmail } from "@/lib/mail";
import { PrismaClient, Role } from "@prisma/client";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

export const inviteUser = async (email: string) => {
    try {
        const session = await auth();

        // Check if user is authenticated and is an admin (optional check depending on requirements)
        if (!session?.user) {
            return { error: "Unauthorized" };
        }

        if (!email) {
            return { error: "Email is required" };
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return { error: "User already exists with this email" };
        }

        await sendInvitationEmail(email);

        return { success: "Invitation sent successfully!" };
    } catch (error) {
        console.error("Invite error:", error);
        return { error: "Failed to send invitation" };
    }
};

export const deleteUser = async (userId: string) => {
    try {
        const session = await auth();

        if (!session?.user) {
            return { error: "Unauthorized" };
        }

        // Optional: Check specific admin role if needed
        // if (session.user.role !== 'ADMIN') return { error: "Forbidden" };

        if (!userId) {
            return { error: "User ID is required" };
        }

        await prisma.user.delete({
            where: { id: userId }
        });

        return { success: "User deleted successfully" };
    } catch (error) {
        console.error("Delete user error:", error);
        return { error: "Failed to delete user" };
    }
};

export const updateUserRole = async (userId: string, role: Role) => {
    try {
        const session = await auth();

        if (!session?.user) {
            return { error: "Unauthorized" };
        }

        if (!userId) {
            return { error: "User ID is required" };
        }

        await prisma.user.update({
            where: { id: userId },
            data: { role }
        });

        return { success: "Role updated successfully" };
    } catch (error) {
        console.error("Update role error:", error);
        return { error: "Failed to update role" };
    }
};
