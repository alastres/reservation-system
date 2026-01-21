"use server";

import { prisma } from "@/lib/prisma";
import { stripe, refundPayment as processRefund } from "@/lib/stripe";
import { revalidatePath } from "next/cache";

/**
 * Confirm payment and update booking status
 */
export async function confirmPayment(bookingId: string, paymentIntentId: string) {
    try {
        // Verify payment intent status
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== "succeeded") {
            return { error: "Payment not completed" };
        }

        // Update booking
        const booking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                paymentStatus: "PAID",
                paymentIntentId,
                amountPaid: paymentIntent.amount / 100, // Convert from cents
                status: "CONFIRMED",
            },
        });

        revalidatePath("/dashboard/bookings");

        return { success: "Payment confirmed successfully", booking };
    } catch (error: any) {
        console.error("Error confirming payment:", error);
        return { error: error.message || "Failed to confirm payment" };
    }
}

/**
 * Request refund for a cancelled booking
 */
export async function requestRefund(bookingId: string, reason?: string) {
    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { service: true },
        });

        if (!booking) {
            return { error: "Booking not found" };
        }

        if (!booking.paymentIntentId) {
            return { error: "No payment to refund" };
        }

        if (booking.paymentStatus !== "PAID") {
            return { error: "Payment is not in paid status" };
        }

        // Process refund with Stripe
        const refundResult = await processRefund(booking.paymentIntentId, reason);

        if (refundResult.error) {
            return { error: refundResult.error };
        }

        // Update booking status
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                paymentStatus: "REFUNDED",
                refundId: refundResult.refund?.id,
                status: "CANCELLED",
            },
        });

        revalidatePath("/dashboard/bookings");

        return { success: "Refund processed successfully", booking: updatedBooking };
    } catch (error: any) {
        console.error("Error processing refund:", error);
        return { error: error.message || "Failed to process refund" };
    }
}

/**
 * Get payment status for a booking
 */
export async function getPaymentStatus(bookingId: string) {
    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            select: {
                paymentStatus: true,
                paymentIntentId: true,
                amountPaid: true,
                currency: true,
            },
        });

        return { success: true, payment: booking };
    } catch (error: any) {
        console.error("Error getting payment status:", error);
        return { error: error.message || "Failed to get payment status" };
    }
}
