import { resetDemoAccount } from "@/actions/demo";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'; // static by default, unless reading the request

export async function GET(request: Request) {
    // Verify authorization if needed (e.g., via CRON_SECRET env var)
    // For Vercel Cron, checking the header is recommended
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        await resetDemoAccount();
        return NextResponse.json({ success: true, message: "Demo account reset" });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to reset" }, { status: 500 });
    }
}
