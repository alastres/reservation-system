import { Suspense } from "react";
import { getNotificationLogs, LogFilter } from "@/actions/logs";
import { LogsTable } from "@/components/logs/logs-table";
import { Separator } from "@/components/ui/separator";

export const metadata = {
    title: "Notification Logs",
    description: "View history of sent emails and notifications.",
};

interface LogsPageProps {
    searchParams: {
        page?: string;
        filter?: string;
    };
}

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogsClientWrapper } from "@/components/logs/logs-client-wrapper";

export default async function LogsPage(props: LogsPageProps) {
    const session = await auth();

    // Strict RBAC: Only ADMIN can access
    if (session?.user?.role !== "ADMIN") {
        redirect("/dashboard");
    }

    const searchParams = await props.searchParams;
    const page = Number(searchParams?.page) || 1;
    const filter = (searchParams?.filter as LogFilter) || "ALL";

    const { logs, pagination, error } = await getNotificationLogs(page, 20, filter);

    if (error) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-destructive">Error</h1>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Notification Logs</h2>
            </div>
            <Separator />

            <Suspense fallback={<div>Loading logs...</div>}>
                <LogsClientWrapper
                    initialLogs={logs || []}
                    pagination={pagination || { total: 0, pages: 1, current: 1, limit: 20 }}
                    initialFilter={filter}
                />
            </Suspense>
        </div>
    );
}
