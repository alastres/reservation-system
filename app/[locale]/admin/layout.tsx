import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { Toaster } from 'sonner';
import { Link } from "@/i18n/routing";
import { LayoutDashboard, Users, FileText, LogOut, ChartPie } from "lucide-react";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { getTranslations } from "next-intl/server";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const t = await getTranslations("Admin.nav");

    if (!session?.user || session.user.role !== Role.ADMIN) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <nav className="border-b border-border bg-background/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4 md:gap-8">
                    <AdminMobileNav />

                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="font-bold text-primary-foreground">S</span>
                        </div>
                        <h1 className="text-xl font-bold text-foreground">
                            Scheduler
                        </h1>
                    </div>

                    <div className="hidden md:flex items-center gap-1">
                        <Link
                            href="/admin"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            {t('overview')}
                        </Link>
                        <Link
                            href="/admin/users"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all"
                        >
                            <Users className="w-4 h-4" />
                            {t('users')}
                        </Link>
                        <Link
                            href="/admin/logs"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all"
                        >
                            <FileText className="w-4 h-4" />
                            {t('logs')}
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-foreground">{session.user.name}</p>
                        <p className="text-xs text-muted-foreground">{session.user.email}</p>
                    </div>
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-xs bg-muted/50 hover:bg-muted border border-border px-4 py-2 rounded-full transition-all text-muted-foreground hover:text-foreground group"
                    >
                        <LogOut className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                        {t('exit')}
                    </Link>
                </div>
            </nav>

            <main className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
            </main>
            <Toaster />
        </div>
    );
}
