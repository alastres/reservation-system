import { prisma } from "@/lib/prisma";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "next-intl/server";

export default async function SystemLogsPage() {
    const t = await getTranslations("Admin.logs");

    const logs = await prisma.systemLog.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: { name: true, email: true }
            }
        },
        take: 100 // Limit to recent 100 logs
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">{t("title")}</h2>
                    <p className="text-slate-400">{t("subtitle")}</p>
                </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-white/10 hover:bg-white/5">
                            <TableHead className="w-[180px] text-slate-300">{t("table.timestamp")}</TableHead>
                            <TableHead className="text-slate-300">{t("table.action")}</TableHead>
                            <TableHead className="text-slate-300">{t("table.user")}</TableHead>
                            <TableHead className="text-slate-300">{t("table.details")}</TableHead>
                            <TableHead className="text-right text-slate-300">{t("table.ipAddress")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                                        <p className="text-sm font-medium">{t("table.noLogs")}</p>
                                        <p className="text-xs">{t("table.noLogsDesc")}</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log) => (
                                <TableRow key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <TableCell className="font-mono text-xs text-slate-400">
                                        {format(log.createdAt, 'yyyy-MM-dd HH:mm:ss')}
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                                            {log.action}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-slate-200">{log.user?.email || 'System'}</div>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-400 max-w-[400px] truncate" title={log.details ? JSON.stringify(log.details) : ''}>
                                        {log.details ? JSON.stringify(log.details) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs text-slate-500">
                                        {log.ip || '-'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
