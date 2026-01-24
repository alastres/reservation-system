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
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 to-black text-slate-100 font-sans selection:bg-indigo-500/30">
            <nav className="border-b border-white/10 bg-black/20 backdrop-blur-xl px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4 md:gap-8">
                    <AdminMobileNav />

                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="font-bold text-white">S</span>
                        </div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Scheduler
                        </h1>
                    </div>

                    <div className="hidden md:flex items-center gap-1">
                        <Link
                            href="/admin"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            {t('overview')}
                        </Link>
                        <Link
                            href="/admin/users"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        >
                            <Users className="w-4 h-4" />
                            {t('users')}
                        </Link>
                        <Link
                            href="/admin/logs"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        >
                            <FileText className="w-4 h-4" />
                            {t('logs')}
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-white">{session.user.name}</p>
                        <p className="text-xs text-slate-500">{session.user.email}</p>
                    </div>
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full transition-all text-slate-300 hover:text-white group"
                    >
                        <LogOut className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                        {t('exit')}
                    </Link>
                </div>
            </nav>

            <main className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
            </main>
            <Toaster theme="dark" />
        </div>
    );
}
