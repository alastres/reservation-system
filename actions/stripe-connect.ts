"use server";

import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Creates a Stripe Connect account for the current user (if one doesn't exist)
 * and generates an onboarding link.
 */
export async function createStripeConnectOnboardingLink() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "No autenticado" };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user) {
            return { error: "Usuario no encontrado" };
        }

        let accountId = user.stripeConnectedAccountId;

        // If the user doesn't have a connected account yet, create one
        if (!accountId) {
            const account = await stripe.accounts.create({
                type: "express",
                country: "US", // Default to US, can be dynamic based on user location
                email: user.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                business_type: "individual",
                metadata: {
                    userId: user.id
                }
            });

            accountId = account.id;

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    stripeConnectedAccountId: accountId,
                    stripeConnectedAccountStatus: "pending"
                }
            });
        }

        // Generate the onboarding link
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?status=connect_refresh`,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?status=connect_success`,
            type: "account_onboarding",
        });

        return { url: accountLink.url };
    } catch (error: any) {
        console.error("Error creating onboarding link:", error);
        return { error: error.message || "Error al crear el enlace de conexión" };
    }
}

/**
 * Checks the status of the connected Stripe account and updates it in the DB
 */
export async function updateStripeConnectStatus() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "No autenticado" };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user?.stripeConnectedAccountId) {
            return { error: "No hay cuenta de Stripe conectada" };
        }

        const account = await stripe.accounts.retrieve(user.stripeConnectedAccountId);

        const status = account.details_submitted ? "active" : "pending";

        await prisma.user.update({
            where: { id: user.id },
            data: { stripeConnectedAccountStatus: status }
        });

        revalidatePath("/dashboard/settings");
        return { success: true, status };
    } catch (error: any) {
        console.error("Error updating connect status:", error);
        return { error: error.message };
    }
}
