import { prisma } from "@/lib/prisma";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { UserRoleSelect } from "@/components/admin/user-role-select";
import { DeleteUserButton } from "@/components/admin/delete-user-button";
import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";

export default async function AdminUsersPage() {
    const session = await auth();
    const t = await getTranslations("Admin.users");

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
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
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">{t("title")}</h2>
                    <p className="text-muted-foreground">{t("subtitle")}</p>
                </div>
            </div>

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
                                        {format(user.createdAt, 'MMM d, yyyy')}
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
        </div>
    );
}
