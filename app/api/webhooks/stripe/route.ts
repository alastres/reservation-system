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
