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
import { UserRoleSelect } from "@/components/admin/user-role-select";
import { DeleteUserButton } from "@/components/admin/delete-user-button";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface User {
    id: string;
    name: string | null;
    email: string | null;
    username: string | null;
    role: "USER" | "ADMIN";
    createdAt: Date;
    _count: {
        bookings: number;
        services: number;
    };
}

interface UsersTableProps {
    users: User[];
    page: number;
    totalPages: number;
    totalUsers: number;
}

export function UsersTable({ users, page, totalPages, totalUsers }: UsersTableProps) {
    const t = useTranslations("Admin.users");
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
                            <TableHead className="text-muted-foreground">{t("table.user")}</TableHead>
                            <TableHead className="text-muted-foreground">{t("table.role")}</TableHead>
                            <TableHead className="text-muted-foreground">{t("table.stats")}</TableHead>
                            <TableHead className="text-muted-foreground">{t("table.joined")}</TableHead>
                            <TableHead className="text-right text-muted-foreground">{t("table.actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <p className="text-sm font-medium">{t("table.noUsers")}</p>
                                        <p className="text-xs">{t("table.noUsersDesc")}</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                    <TableCell>
                                        <div className="font-medium text-foreground">{user.name || "No Name"}</div>
                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                        {user.username && <div className="text-xs text-indigo-500 font-medium">@{user.username}</div>}
                                    </TableCell>
                                    <TableCell>
                                        <UserRoleSelect
                                            userId={user.id}
                                            currentRole={user.role}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs space-y-1 text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <span className="w-16">{t("stats.services")}</span>
                                                <span className="text-foreground font-medium">{user._count.services}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-16">{t("stats.bookings")}</span>
                                                <span className="text-foreground font-medium">{user._count.bookings}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {format(new Date(user.createdAt), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DeleteUserButton userId={user.id} />
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
                        count: users.length,
                        total: totalUsers
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
