import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createPortalSession } from "@/actions/subscription";

export async function POST() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.redirect(new URL("/auth/login", process.env.NEXT_PUBLIC_APP_URL));
    }

    const result = await createPortalSession();

    if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 });
    }

    if (result.url) {
        return NextResponse.redirect(result.url);
    }

    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
}
