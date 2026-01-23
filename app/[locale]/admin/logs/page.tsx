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

export default async function SystemLogsPage() {
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
                    <h2 className="text-3xl font-bold tracking-tight text-white">System Logs</h2>
                    <p className="text-slate-400">Audit trail of system actions.</p>
                </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-white/10 hover:bg-white/5">
                            <TableHead className="w-[180px] text-slate-300">Timestamp</TableHead>
                            <TableHead className="text-slate-300">Action</TableHead>
                            <TableHead className="text-slate-300">User</TableHead>
                            <TableHead className="text-slate-300">Details</TableHead>
                            <TableHead className="text-right text-slate-300">IP Address</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                                        <p className="text-sm font-medium">No system logs found</p>
                                        <p className="text-xs">Actions performed in the system will appear here.</p>
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
                                    <TableCell className="text-sm text-slate-400 max-w-[400px] truncate" title={log.details || ''}>
                                        {log.details || '-'}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs text-slate-500">
                                        {log.ipAddress || '-'}
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
