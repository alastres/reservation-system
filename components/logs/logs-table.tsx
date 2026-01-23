"use client";

import { useState } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { LogFilter } from "@/actions/logs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface NotificationLog {
    id: string;
    type: string;
    status: string;
    metadata: any;
    createdAt: Date;
}

interface LogsTableProps {
    initialLogs: NotificationLog[];
    pagination: {
        total: number;
        pages: number;
        current: number;
        limit: number;
    };
    currentFilter: LogFilter;
    onFilterChange: (filter: LogFilter) => void;
    onPageChange: (page: number) => void;
}

export function LogsTable({
    initialLogs,
    pagination,
    currentFilter,
    onFilterChange,
    onPageChange,
}: LogsTableProps) {
    const t = useTranslations('Logs');
    const format = useFormatter();

    const getLogTypeLabel = (type: string) => {
        // Safe check if the type exists in options, otherwise fallback to raw type
        const key = type as "CLIENT_CONFIRMATION" | "BOOKING_RECEIVED" | "CLIENT_CANCELLATION" | "CLIENT_RESCHEDULE" | "REMINDER_24H" | "REMINDER_1H";
        try {
            return t(`filters.options.${key}`);
        } catch (e) {
            return type;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{t('filters.label')}</span>
                    <Select
                        value={currentFilter}
                        onValueChange={(value) => onFilterChange(value as LogFilter)}
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder={t('filters.allTypes')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">{t('filters.allTypes')}</SelectItem>
                            <SelectItem value="CLIENT_CONFIRMATION">{t('filters.options.CLIENT_CONFIRMATION')}</SelectItem>
                            <SelectItem value="BOOKING_RECEIVED">{t('filters.options.BOOKING_RECEIVED')}</SelectItem>
                            <SelectItem value="CLIENT_CANCELLATION">{t('filters.options.CLIENT_CANCELLATION')}</SelectItem>
                            <SelectItem value="CLIENT_RESCHEDULE">{t('filters.options.CLIENT_RESCHEDULE')}</SelectItem>
                            <SelectItem value="REMINDER_24H">{t('filters.options.REMINDER_24H')}</SelectItem>
                            <SelectItem value="REMINDER_1H">{t('filters.options.REMINDER_1H')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('table.headers.date')}</TableHead>
                            <TableHead>{t('table.headers.type')}</TableHead>
                            <TableHead>{t('table.headers.status')}</TableHead>
                            <TableHead>{t('table.headers.recipient')}</TableHead>
                            <TableHead className="text-right">{t('table.headers.details')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialLogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    {t('table.noLogs')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            initialLogs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>
                                        {format.dateTime(new Date(log.createdAt), {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{getLogTypeLabel(log.type)}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                log.status === "SENT"
                                                    ? "default" // or success/secondary if available
                                                    : "destructive"
                                            }
                                            className={log.status === "SENT" ? "bg-green-600 hover:bg-green-700" : ""}
                                        >
                                            {log.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {log.metadata?.email || log.metadata?.providerEmail || "-"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    {t('table.view')}
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-[600px]">
                                                <DialogHeader>
                                                    <DialogTitle>{t('table.dialogTitle')}</DialogTitle>
                                                </DialogHeader>
                                                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                                                    <pre className="text-sm">
                                                        {JSON.stringify(log, null, 2)}
                                                    </pre>
                                                </ScrollArea>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(pagination.current - 1)}
                    disabled={pagination.current <= 1}
                >
                    {t('table.pagination.previous')}
                </Button>
                <span className="text-sm text-muted-foreground">
                    {t('table.pagination.page')} {pagination.current} {t('table.pagination.of')} {pagination.pages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(pagination.current + 1)}
                    disabled={pagination.current >= pagination.pages}
                >
                    {t('table.pagination.next')}
                </Button>
            </div>
        </div>
    );
}
