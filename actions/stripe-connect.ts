"use server";

<<<<<<< HEAD
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
=======
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
>>>>>>> master
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
<<<<<<< HEAD
 * Create a Stripe Connect account and get onboarding link
 */
import { getTranslations } from "next-intl/server";

export async function createConnectAccount() {
    const t = await getTranslations("Stripe");
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: t("unauthorized") };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { email: true, stripeConnectAccountId: true, stripeConnectStatus: true },
        });

        if (!user) {
            return { error: t("userNotFound") };
        }

        let accountId = user.stripeConnectAccountId;

        // Create a Connect Account if doesn't exist
        if (!accountId) {
            const account = await stripe.accounts.create({
                type: "express", // or 'standard'
=======
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
>>>>>>> master
                email: user.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
<<<<<<< HEAD
=======
                business_type: "individual",
                metadata: {
                    userId: user.id
                }
>>>>>>> master
            });

            accountId = account.id;

            await prisma.user.update({
<<<<<<< HEAD
                where: { id: session.user.id },
                data: { stripeConnectAccountId: accountId },
            });
        }

        // Create Account Link for onboarding
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?stripe_connect=refresh`,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?stripe_connect=return`,
            type: "account_onboarding",
        });

        return { success: true, url: accountLink.url };
    } catch (error: any) {
        console.error("Error creating Connect account:", error);
        return { error: t("connectFailed") };
    }
}

export async function getConnectStatus() {
    const t = await getTranslations("Stripe");
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: t("unauthorized") };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { stripeConnectAccountId: true, stripeConnectStatus: true },
        });

        if (!user?.stripeConnectAccountId) {
            return { connected: false };
        }

        const account = await stripe.accounts.retrieve(user.stripeConnectAccountId);

        // Check if charges are enabled (fully onboarded)
        const isEnabled = account.charges_enabled && account.details_submitted;

        if (user.stripeConnectStatus !== (isEnabled ? "ACTIVE" : "PENDING")) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: { stripeConnectStatus: isEnabled ? "ACTIVE" : "PENDING" }
            });
        }

        return { connected: isEnabled, details: JSON.parse(JSON.stringify(account)) };
    } catch (error: any) {
        console.error("Error checking Connect status:", error);
        return { error: t("statusFailed") };
    }
}

export async function disconnectStripeAccount() {
    const t = await getTranslations("Stripe");
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: t("unauthorized") };
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                stripeConnectAccountId: null,
                stripeConnectStatus: "INACTIVE"
            }
        });

        revalidatePath("/dashboard/settings");

        return { success: t("disconnectSuccess") };
    } catch (error) {
        console.error("Disconnect error", error);
        return { error: t("disconnectFailed") };
=======
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
>>>>>>> master
    }
}
