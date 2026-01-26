"use server";

import { auth, signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const connectGoogle = async () => {
    await signIn("google", { redirectTo: "/dashboard/settings/integrations" });
}

export const disconnectGoogle = async () => {
    const session = await auth();
    if (!session?.user?.id) return;

    try {
        await prisma.account.deleteMany({
            where: {
                userId: session.user.id,
                provider: "google"
            }
        });
        revalidatePath("/dashboard/settings/integrations");
    } catch (error) {
        console.error("Failed to disconnect Google:", error);
    }
}
