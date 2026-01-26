import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { UsersTable } from "@/components/admin/users-table";
import { SearchInput } from "@/components/ui/search-input";
import { Prisma } from "@prisma/client";

interface Props {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
    const resolvedSearchParams = await searchParams;
    const t = await getTranslations("Admin.users");

    // Pagination logic
    const page = Number(resolvedSearchParams.page) || 1;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    // ... inside component ...
    const query = resolvedSearchParams.search as string;

    const whereClause: Prisma.UserWhereInput = query ? {
        OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { username: { contains: query, mode: "insensitive" } }
        ]
    } : {};

    const [users, totalUsers] = await Promise.all([
        prisma.user.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            take: pageSize,
            skip: skip,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                username: true,
                _count: {
                    select: { bookings: true, services: true }
                }
            }
        }),
        prisma.user.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalUsers / pageSize);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">{t("title")}</h2>
                    <p className="text-muted-foreground">{t("subtitle")}</p>
                </div>
                <SearchInput placeholder={t("table.searchPlaceholder") || "Buscar usuarios..."} className="w-[300px]" />
            </div>

            <UsersTable
                users={users}
                page={page}
                totalPages={totalPages}
                totalUsers={totalUsers}
            />
        </div>
    );
}
