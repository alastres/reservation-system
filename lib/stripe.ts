import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-12-18.acacia",
    typescript: true,
});

/**
 * Create a payment intent for a booking
 */
export async function createPaymentIntent(
    amount: number,
    currency: string = "usd",
    metadata: Record<string, string>
) {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            metadata,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return { success: true, paymentIntent };
    } catch (error: any) {
        console.error("Error creating payment intent:", error);
        return { error: error.message };
    }
}

/**
 * Refund a payment
 */
export async function refundPayment(paymentIntentId: string, reason?: string) {
    try {
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            reason: reason === "duplicate" || reason === "fraudulent" ? reason : undefined,
        });

        return { success: true, refund };
    } catch (error: any) {
        console.error("Error processing refund:", error);
        return { error: error.message };
    }
}

/**
 * Retrieve a payment intent
 */
export async function getPaymentIntent(paymentIntentId: string) {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        return { success: true, paymentIntent };
    } catch (error: any) {
        console.error("Error retrieving payment intent:", error);
        return { error: error.message };
    }
}
