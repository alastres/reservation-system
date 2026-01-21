"use client";

import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { FormError } from "@/components/form-error";

interface CheckoutFormProps {
    clientSecret: string;
    onSuccess: (paymentIntentId: string) => void;
    onCancel: () => void;
}

export const CheckoutForm = ({ clientSecret, onSuccess, onCancel }: CheckoutFormProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setError(submitError.message || "An error occurred");
            setLoading(false);
            return;
        }

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL is not needed if we handle it here, 
                // but Stripe sometimes requires it for certain methods.
                return_url: `${window.location.origin}/payment-confirm`,
            },
            redirect: "if_required",
        });

        if (error) {
            setError(error.message || "Payment failed");
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            onSuccess(paymentIntent.id);
        } else {
            setError("Payment processing. Please wait.");
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <PaymentElement />
            <FormError message={error || undefined} />
            <div className="flex gap-3 pt-4">
                <Button variant="ghost" type="button" onClick={onCancel} disabled={loading}>
                    Back
                </Button>
                <Button className="flex-1" type="submit" disabled={!stripe || loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Pay and Confirm
                </Button>
            </div>
        </form>
    );
};
