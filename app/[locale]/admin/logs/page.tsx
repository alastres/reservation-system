import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { SystemLogsTable } from "@/components/admin/system-logs-table";
import { SearchInput } from "@/components/ui/search-input";
import { Prisma } from "@prisma/client";

interface Props {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SystemLogsPage({ searchParams }: Props) {
    const resolvedSearchParams = await searchParams;
    const t = await getTranslations("Admin.logs");

    // Pagination logic
    const page = Number(resolvedSearchParams.page) || 1;
    const pageSize = 20; // Logs usually have higher density, so 20 is good
    const skip = (page - 1) * pageSize;

    // ... inside component ...
    const query = resolvedSearchParams.search as string;

    const whereClause: Prisma.SystemLogWhereInput = query ? {
        OR: [
            { action: { contains: query, mode: "insensitive" } },
            { user: { email: { contains: query, mode: "insensitive" } } },
            { user: { name: { contains: query, mode: "insensitive" } } }
        ]
    } : {};

    const [logs, totalLogs] = await Promise.all([
        prisma.systemLog.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            take: pageSize,
            skip: skip,
            include: {
                user: {
                    select: { name: true, email: true }
                }
            }
        }),
        prisma.systemLog.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalLogs / pageSize);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">{t("title")}</h2>
                    <p className="text-muted-foreground">{t("subtitle")}</p>
                </div>
                <SearchInput placeholder={t("table.searchPlaceholder") || "Buscar en registros..."} className="w-[300px]" />
            </div>

            <SystemLogsTable
                logs={logs}
                page={page}
                totalPages={totalPages}
                totalLogs={totalLogs}
            />
        </div>
    );
}
