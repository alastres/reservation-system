"use server";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Price IDs from environment
// Price IDs from environment
const PRICE_IDS = {
    // FREE: "FREE", // Handled internally
    PRO: process.env.STRIPE_PRICE_PRO,
    BUSINESS: process.env.STRIPE_PRICE_BUSINESS,
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

export async function createSubscriptionCheckout(plan: "FREE" | "PRO" | "BUSINESS") {
    const t = await getTranslations("Subscription");
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: t("unauthorized") };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { email: true, stripeCustomerId: true, subscriptionPlan: true, subscriptionStatus: true },
        });

        if (!user?.email) {
            return { error: t("emailNotFound") };
        }

        // Handle FREE plan directly (no Stripe)
        if (plan === "FREE") {
            // If user is already on a paid plan, they should cancel via portal, not here. 
            // Or we can treat this as "Downgrade" which might be complex.
            // For simplicity: If user has no active stripe sub, allow switch to FREE.
            if (user.stripeCustomerId && user.subscriptionStatus === "ACTIVE" && user.subscriptionPlan !== "FREE") {
                return { error: t("usePortalToDowngrade") }; // "Please use billing portal to manage current subscription"
            }

            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    subscriptionPlan: "FREE",
                    subscriptionStatus: "ACTIVE",
                    subscriptionEndsAt: null, // Perpetual
                }
            });

            revalidatePath("/dashboard");
            return { success: true, url: "/dashboard?plan=free_success" };
        }


        // Check if user already has active subscription (for Paid plans)
        if (user.stripeCustomerId) {
            const subscriptions = await stripe.subscriptions.list({
                customer: user.stripeCustomerId,
                status: "active",
                limit: 1,
            });

            if (subscriptions.data.length > 0) {
                // If already active, maybe redirect to portal or return error
                // But if they are upgrading, we might want to create a checkout session?
                // Usually upgrades are handled in Portal or via specific checkout mode.
                // For now, simple block.
                return { error: t("alreadyActive") };
            }
        }

        const priceId = PRICE_IDS[plan as keyof typeof PRICE_IDS];
        if (!priceId) {
            // console.error(`Price ID not found for plan: ${plan}`);
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
