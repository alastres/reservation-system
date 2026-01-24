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

import { unstable_cache } from "next/cache";

export const getUserByUsername = async (username: string) => {
    try {
        const getCachedUser = unstable_cache(
            async (uname) => {
                return await prisma.user.findUnique({
                    where: { username: uname },
                    include: {
                        services: {
                            where: { isActive: true },
                            orderBy: { createdAt: "desc" }
                        }
                    }
                });
            },
            [`user-profile-${username}`], // Cache key
            {
                tags: [`user-profile-${username}`],
                revalidate: 300 // 5 minutes
            }
        );

        return await getCachedUser(username);
    } catch {
        return null;
    }
};
