import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("stripe-signature");

    if (!signature) {
        return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return NextResponse.json(
            { error: `Webhook Error: ${err.message}` },
            { status: 400 }
        );
    }

    // Handle the event
    try {
        switch (event.type) {
            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;

                // Update booking status to PAID
                await prisma.booking.updateMany({
                    where: { paymentIntentId: paymentIntent.id },
                    data: {
                        paymentStatus: "PAID",
                        amountPaid: paymentIntent.amount / 100,
                        status: "CONFIRMED",
                    },
                });

                console.log(`Payment succeeded: ${paymentIntent.id}`);
                break;
            }

            case "payment_intent.payment_failed": {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;

                // Update booking status to FAILED
                await prisma.booking.updateMany({
                    where: { paymentIntentId: paymentIntent.id },
                    data: {
                        paymentStatus: "FAILED",
                    },
                });

                console.log(`Payment failed: ${paymentIntent.id}`);
                break;
            }

            case "payment_intent.canceled": {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;

                // Update booking status to CANCELLED
                await prisma.booking.updateMany({
                    where: { paymentIntentId: paymentIntent.id },
                    data: {
                        paymentStatus: "FAILED",
                        status: "CANCELLED",
                    },
                });

                console.log(`Payment canceled: ${paymentIntent.id}`);
                break;
            }

            // SUBSCRIPTION EVENTS (Platform subscriptions for owners)
            case "customer.subscription.created":
            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;

                // Get user from metadata or customer
                const userId = subscription.metadata?.userId;
                if (!userId) {
                    console.error("No userId in subscription metadata");
                    break;
                }

                // Determine subscription plan from price
                let plan: "MONTHLY" | "QUARTERLY" | "ANNUAL" | null = null;
                const priceId = subscription.items.data[0]?.price.id;

                if (priceId === process.env.STRIPE_PRICE_MONTHLY) plan = "MONTHLY";
                else if (priceId === process.env.STRIPE_PRICE_QUARTERLY) plan = "QUARTERLY";
                else if (priceId === process.env.STRIPE_PRICE_ANNUAL) plan = "ANNUAL";

                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        subscriptionStatus: subscription.status === "active" ? "ACTIVE" :
                            subscription.status === "past_due" ? "PAST_DUE" :
                                subscription.status === "trialing" ? "TRIALING" : "INACTIVE",
                        subscriptionPlan: plan,
                        stripeCustomerId: subscription.customer as string,
                        stripeSubscriptionId: subscription.id,
                        subscriptionEndsAt: new Date((subscription as any).current_period_end * 1000),
                    },
                });

                console.log(`Subscription ${event.type}: ${subscription.id}`);
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;

                await prisma.user.updateMany({
                    where: { stripeSubscriptionId: subscription.id },
                    data: {
                        subscriptionStatus: "CANCELLED",
                    },
                });

                console.log(`Subscription deleted: ${subscription.id}`);
                break;
            }

            case "invoice.payment_succeeded": {
                const invoice = event.data.object as Stripe.Invoice;

                // Update subscription end date when payment succeeds
                if ((invoice as any).subscription) {
                    const subscription = await stripe.subscriptions.retrieve(
                        (invoice as any).subscription as string
                    );

                    await prisma.user.updateMany({
                        where: { stripeSubscriptionId: subscription.id },
                        data: {
                            subscriptionStatus: "ACTIVE",
                            subscriptionEndsAt: new Date((subscription as any).current_period_end * 1000),
                        },
                    });

                    console.log(`Invoice payment succeeded: ${invoice.id}`);
                }
                break;
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice;

                if ((invoice as any).subscription) {
                    await prisma.user.updateMany({
                        where: { stripeSubscriptionId: (invoice as any).subscription as string },
                        data: {
                            subscriptionStatus: "PAST_DUE",
                        },
                    });

                    console.log(`Invoice payment failed: ${invoice.id}`);
                }
                break;
            }

            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;

                // Handle subscription checkout completion
                if (session.mode === "subscription" && session.client_reference_id) {
                    const userId = session.client_reference_id;
                    const subscriptionId = session.subscription as string;

                    if (subscriptionId) {
                        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

                        let plan: "MONTHLY" | "QUARTERLY" | "ANNUAL" | null = null;
                        const priceId = subscription.items.data[0]?.price.id;

                        if (priceId === process.env.STRIPE_PRICE_MONTHLY) plan = "MONTHLY";
                        else if (priceId === process.env.STRIPE_PRICE_QUARTERLY) plan = "QUARTERLY";
                        else if (priceId === process.env.STRIPE_PRICE_ANNUAL) plan = "ANNUAL";

                        await prisma.user.update({
                            where: { id: userId },
                            data: {
                                subscriptionStatus: "ACTIVE",
                                subscriptionPlan: plan,
                                stripeCustomerId: session.customer as string,
                                stripeSubscriptionId: subscriptionId,
                                subscriptionEndsAt: new Date((subscription as any).current_period_end * 1000),
                            },
                        });

                        console.log(`Checkout completed for user: ${userId}`);
                    }
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error("Error processing webhook:", err);
        return NextResponse.json(
            { error: "Webhook handler failed" },
            { status: 500 }
        );
    }
}
