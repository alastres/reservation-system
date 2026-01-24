"use server";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
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
                email: user.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
            });

            accountId = account.id;

            await prisma.user.update({
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
    }
}
