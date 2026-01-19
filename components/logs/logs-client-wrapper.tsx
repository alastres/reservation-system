"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { LogsTable } from "@/components/logs/logs-table";

interface NotificationLog {
    id: string;
    type: string;
    status: string;
    metadata: any;
    createdAt: Date;
}

interface Pagination {
    total: number;
    pages: number;
    current: number;
    limit: number;
}

interface LogsClientWrapperProps {
    initialLogs: NotificationLog[];
    pagination: Pagination;
    initialFilter: string;
}

export function LogsClientWrapper({ initialLogs, pagination, initialFilter }: LogsClientWrapperProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleFilterChange = (filter: string) => {
        const params = new URLSearchParams(searchParams);
        if (filter === "ALL") {
            params.delete("filter");
        } else {
            params.set("filter", filter);
        }
        params.set("page", "1"); // Reset to page 1
        router.push(`${pathname}?${params.toString()}`);
    };

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", String(page));
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <LogsTable
            initialLogs={initialLogs}
            pagination={pagination}
            currentFilter={initialFilter as any}
            onFilterChange={handleFilterChange}
            onPageChange={handlePageChange}
        />
    );
}
