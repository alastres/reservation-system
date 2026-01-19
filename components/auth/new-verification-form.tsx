"use client";

import { useRef, useState, useEffect, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // Import useSession
import { newVerification } from "@/actions/new-verification";
import { resendVerificationEmail } from "@/actions/resend-verification"; // Import new action
import { CardWrapper } from "@/components/auth/card-wrapper";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component

export const NewVerificationForm = () => {
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();
    const [isPending, startTransition] = useTransition();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter(); // Use useRouter for navigation
    const { update } = useSession(); // Access update method

    const fired = useRef(false);

    useEffect(() => {
        if (fired.current) return;
        if (!token) return; // Don't verify if no token, just wait for user action

        fired.current = true;

        newVerification(token)
            .then((data) => {
                if (data.success) {
                    setSuccess(data.success);
                    setError(data.error); // This will likely be undefined if success is true
                    // Refresh session and redirect
                    update().then(() => {
                        // Force a hard alignment of the session
                        setTimeout(() => {
                            window.location.assign("/dashboard");
                        }, 500);
                    });
                } else {
                    setError(data.error);
                }
            })
            .catch(() => {
                setError("Something went wrong!");
            });
    }, [token, update, router]);

    const onResend = () => {
        setError("");
        setSuccess("");
        startTransition(() => {
            resendVerificationEmail()
                .then((data) => {
                    if (data.error) setError(data.error);
                    if (data.success) setSuccess(data.success);
                })
                .catch(() => setError("Something went wrong!"));
        });
    };

    return (
        <CardWrapper
            headerLabel={token ? "Confirming your verification" : "Verification Required"}
            backButtonLabel=""
            backButtonHref="/auth/login"
        >
            <div className="flex flex-col items-center w-full justify-center space-y-4">
                {!token && (
                    <div className="text-center w-full">
                        <p className="text-sm text-muted-foreground mb-6">
                            Your email is not verified. Please check your inbox for a confirmation email.
                        </p>

                        <div className="flex flex-col gap-4">
                            <Button
                                onClick={onResend}
                                disabled={isPending}
                                variant="default"
                                className="w-full"
                            >
                                {isPending ? "Sending..." : "Resend verification email"}
                            </Button>

                            <button
                                onClick={() => window.location.href = "/api/auth/signout"}
                                className="text-sm font-medium text-destructive hover:underline"
                            >
                                Log out to switch accounts
                            </button>
                        </div>
                    </div>
                )}

                {token && !success && !error && (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                )}
                <FormSuccess message={success} />
                {!success && (
                    <FormError message={error} />
                )}
            </div>
        </CardWrapper>
    );
}
