"use client";

import { useState } from "react";
import { format } from "date-fns";
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
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Filter by Type:</span>
                    <Select
                        value={currentFilter}
                        onValueChange={(value) => onFilterChange(value as LogFilter)}
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Types</SelectItem>
                            <SelectItem value="CLIENT_CONFIRMATION">Confirmation</SelectItem>
                            <SelectItem value="BOOKING_RECEIVED">New Booking</SelectItem>
                            <SelectItem value="CLIENT_CANCELLATION">Cancellation</SelectItem>
                            <SelectItem value="CLIENT_RESCHEDULE">Reschedule</SelectItem>
                            <SelectItem value="REMINDER_24H">24h Reminder</SelectItem>
                            <SelectItem value="REMINDER_1H">1h Reminder</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Recipient</TableHead>
                            <TableHead className="text-right">Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialLogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No logs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            initialLogs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>
                                        {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{log.type}</Badge>
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
                                                    View
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-[600px]">
                                                <DialogHeader>
                                                    <DialogTitle>Log Details</DialogTitle>
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
                    Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                    Page {pagination.current} of {pagination.pages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(pagination.current + 1)}
                    disabled={pagination.current >= pagination.pages}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
