import { prisma } from "@/lib/prisma";

export const getUserByEmail = async (email: string) => {
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        return user;
    } catch {
        return null;
    }
};

export const getUserById = async (id: string) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        return user;
    } catch {
        return null;
    }
};

export const getUserByUsername = async (username: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                services: {
                    where: { isActive: true },
                    orderBy: { createdAt: "desc" }
                }
            }
        });
        return user;
    } catch {
        return null;
    }
};
