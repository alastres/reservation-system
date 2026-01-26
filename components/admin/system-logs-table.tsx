"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SystemLog {
    id: string;
    action: string;
    details: any;
    ipAddress: string | null;
    createdAt: Date;
    user: {
        name: string | null;
        email: string | null;
    } | null;
}

interface SystemLogsTableProps {
    logs: SystemLog[];
    page: number;
    totalPages: number;
    totalLogs: number;
}

export function SystemLogsTable({ logs, page, totalPages, totalLogs }: SystemLogsTableProps) {
    const t = useTranslations("Admin.logs");
    const router = useRouter();
    const searchParams = useSearchParams();

    const onPageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-border hover:bg-muted/50">
                            <TableHead className="w-[180px] text-muted-foreground">{t("table.timestamp")}</TableHead>
                            <TableHead className="text-muted-foreground">{t("table.action")}</TableHead>
                            <TableHead className="text-muted-foreground">{t("table.user")}</TableHead>
                            <TableHead className="text-muted-foreground">{t("table.details")}</TableHead>
                            <TableHead className="text-right text-muted-foreground">{t("table.ipAddress")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <p className="text-sm font-medium">{t("table.noLogs")}</p>
                                        <p className="text-xs">{t("table.noLogsDesc")}</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log) => (
                                <TableRow key={log.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-500 ring-1 ring-inset ring-indigo-500/20">
                                            {log.action}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-foreground">{log.user?.email || 'System'}</div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground max-w-[400px] truncate" title={log.details ? JSON.stringify(log.details) : ''}>
                                        {log.details ? JSON.stringify(log.details) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                                        {log.ipAddress || '-'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between px-2">
                <div className="text-sm text-muted-foreground">
                    {t("pagination.showing", {
                        count: logs.length,
                        total: totalLogs
                    })}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-medium">
                        {t("pagination.page", { current: page, total: totalPages })}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
