"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function DashboardAutoRefresh() {
    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, 10000); // Poll every 10 seconds for main dashboard stats

        return () => clearInterval(interval);
    }, [router]);

    return null;
}
