"use server";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Price IDs from environment
const PRICE_IDS = {
    MONTHLY: process.env.STRIPE_PRICE_MONTHLY!,
    QUARTERLY: process.env.STRIPE_PRICE_QUARTERLY!,
    ANNUAL: process.env.STRIPE_PRICE_ANNUAL!,
};

/**
 * Check if current user is the first user (admin)
 */
export async function isFirstUser(): Promise<boolean> {
    const userCount = await prisma.user.count();
    return userCount === 0;
}

/**
 * Create Stripe Checkout session for subscription
 */
import { getTranslations } from "next-intl/server";

export async function createSubscriptionCheckout(plan: "MONTHLY" | "QUARTERLY" | "ANNUAL") {
    const t = await getTranslations("Subscription");
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: t("unauthorized") };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { email: true, stripeCustomerId: true },
        });

        if (!user?.email) {
            return { error: t("emailNotFound") };
        }

        // Check if user already has active subscription
        if (user.stripeCustomerId) {
            const subscriptions = await stripe.subscriptions.list({
                customer: user.stripeCustomerId,
                status: "active",
                limit: 1,
            });

            if (subscriptions.data.length > 0) {
                return { error: t("alreadyActive") };
            }
        }

        const priceId = PRICE_IDS[plan];
        if (!priceId) {
            return { error: t("invalidPlan") };
        }

        // Create checkout session
        const checkoutSession = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/select`,
            customer_email: user.email,
            client_reference_id: session.user.id,
            metadata: {
                userId: session.user.id,
                plan,
            },
        });

        return { success: true, url: checkoutSession.url };
    } catch (error: any) {
        console.error("Error creating checkout session:", error);
        return { error: t("createFailed") };
    }
}

export async function createPortalSession() {
    const t = await getTranslations("Subscription");
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: t("unauthorized") };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { stripeCustomerId: true },
        });

        if (!user?.stripeCustomerId) {
            return { error: t("noSubscriptionFound") };
        }

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
        });

        return { success: true, url: portalSession.url };
    } catch (error: any) {
        console.error("Error creating portal session:", error);
        return { error: t("portalFailed") };
    }
}

export async function getSubscriptionStatus() {
    const t = await getTranslations("Subscription");
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: t("unauthorized") };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                subscriptionStatus: true,
                subscriptionPlan: true,
                subscriptionEndsAt: true,
                role: true,
            },
        });

        return { success: true, subscription: user };
    } catch (error: any) {
        console.error("Error getting subscription status:", error);
        return { error: t("statusFailed") };
    }
}

export async function cancelSubscription() {
    const t = await getTranslations("Subscription");
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: t("unauthorized") };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { stripeSubscriptionId: true },
        });

        if (!user?.stripeSubscriptionId) {
            return { error: t("noActiveSubscription") };
        }

        // Cancel at period end
        await stripe.subscriptions.update(user.stripeSubscriptionId, {
            cancel_at_period_end: true,
        });

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                subscriptionStatus: "CANCELLED",
            },
        });

        revalidatePath("/subscription/manage");

        return { success: t("cancelSuccess") };
    } catch (error: any) {
        console.error("Error cancelling subscription:", error);
        return { error: t("cancelFailed") };
    }
}
