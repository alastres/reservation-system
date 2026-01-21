import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.redirect(new URL("/auth/login", process.env.NEXT_PUBLIC_APP_URL));
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user?.stripeCustomerId) {
            return NextResponse.json({ error: "No subscription found" }, { status: 400 });
        }

        console.log("Creating portal for customer:", user.stripeCustomerId);

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
        });

        console.log("Portal URL:", portalSession.url);

        // Use 303 redirect for POST -> GET
        return NextResponse.redirect(portalSession.url, { status: 303 });
    } catch (error: any) {
        console.error("Portal error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
