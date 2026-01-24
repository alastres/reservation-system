"use client";

import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, LayoutDashboard, Users, FileText } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function AdminMobileNav() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const t = useTranslations("Admin.nav");

    const routes = [
        {
            label: t("overview"),
            icon: LayoutDashboard,
            href: "/admin"
        },
        {
            label: t("users"),
            icon: Users,
            href: "/admin/users"
        },
        {
            label: t("logs"),
            icon: FileText,
            href: "/admin/logs"
        }
    ];

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-slate-300 hover:text-white hover:bg-white/10">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 border-white/10 bg-slate-950 w-72">
                <SheetHeader>
                    <SheetTitle className="sr-only">Admin Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col h-full py-4 text-slate-100">
                    <div className="px-6 py-2">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <span className="font-bold text-white">S</span>
                            </div>
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                Scheduler
                            </h1>
                        </div>
                    </div>
                    <div className="space-y-1 px-3">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition-all",
                                    pathname === route.href
                                        ? "bg-white/10 text-white"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <div className="flex items-center flex-1">
                                    <route.icon className={cn("h-5 w-5 mr-3", pathname === route.href ? "text-indigo-400" : "text-slate-500 group-hover:text-indigo-400")} />
                                    {route.label}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
