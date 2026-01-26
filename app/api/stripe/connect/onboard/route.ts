import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createStripeConnectOnboardingLink } from "@/actions/stripe-connect";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.redirect(new URL("/auth/login", req.url));
        }

        const result = await createStripeConnectOnboardingLink();

        if (result.error) {
            console.error("Error creating onboarding link:", result.error);
            return NextResponse.redirect(
                new URL("/dashboard/settings?error=stripe_connect_failed", req.url)
            );
        }

        if (result.url) {
            return NextResponse.redirect(result.url, 303);
        }

        return NextResponse.redirect(
            new URL("/dashboard/settings?error=no_url", req.url)
        );
    } catch (error) {
        console.error("Stripe Connect onboarding error:", error);
        return NextResponse.redirect(
            new URL("/dashboard/settings?error=server_error", req.url)
        );
    }
}
