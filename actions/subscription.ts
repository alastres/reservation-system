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
export async function createSubscriptionCheckout(plan: "MONTHLY" | "QUARTERLY" | "ANNUAL") {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { email: true, stripeCustomerId: true },
        });

        if (!user?.email) {
            return { error: "User email not found" };
        }

        // Check if user already has active subscription
        if (user.stripeCustomerId) {
            const subscriptions = await stripe.subscriptions.list({
                customer: user.stripeCustomerId,
                status: "active",
                limit: 1,
            });

            if (subscriptions.data.length > 0) {
                return { error: "You already have an active subscription" };
            }
        }

        const priceId = PRICE_IDS[plan];
        if (!priceId) {
            return { error: "Invalid subscription plan" };
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
        return { error: error.message || "Failed to create checkout session" };
    }
}

/**
 * Create Stripe Customer Portal session
 */
export async function createPortalSession() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { stripeCustomerId: true },
        });

        if (!user?.stripeCustomerId) {
            return { error: "No se encontró una suscripción activa. Por favor suscríbete primero." };
        }

        console.log("Creating portal session for customer:", user.stripeCustomerId);
        console.log("Return URL:", `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`);

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
        });

        console.log("Portal session created successfully:", portalSession.id);
        return { success: true, url: portalSession.url };
    } catch (error: any) {
        console.error("Error creating portal session:", error);
        console.error("Error details:", {
            message: error.message,
            type: error.type,
            code: error.code,
            statusCode: error.statusCode,
        });
        return { error: error.message || "Failed to create portal session" };
    }
}

/**
 * Get subscription status for current user
 */
export async function getSubscriptionStatus() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
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
        return { error: error.message || "Failed to get subscription status" };
    }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { stripeSubscriptionId: true },
        });

        if (!user?.stripeSubscriptionId) {
            return { error: "No active subscription found" };
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

        return { success: "Subscription will be cancelled at the end of the billing period" };
    } catch (error: any) {
        console.error("Error cancelling subscription:", error);
        return { error: error.message || "Failed to cancel subscription" };
    }
}
