"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import {
    LayoutDashboard,
    Calendar,
    Settings,
    Video,
    Clock,
    Briefcase,
    Users,
    Bug,
    ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserButton } from "@/components/auth/user-button";
import { ThemeToggle } from "@/components/theme-toggle";

const font = Plus_Jakarta_Sans({ weight: "600", subsets: ["latin"] });

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-primary",
    },
    {
        label: "Services",
        icon: Briefcase,
        href: "/dashboard/services",
        color: "text-primary",
    },
    {
        label: "Availability",
        icon: Clock,
        href: "/dashboard/availability",
        color: "text-primary",
    },
    {
        label: "Bookings",
        icon: Calendar,
        href: "/dashboard/bookings",
        color: "text-primary",
    },
    {
        label: "Clients",
        icon: Users,
        href: "/dashboard/clients",
        color: "text-primary",
    },
    {
        label: "Logs",
        icon: Bug,
        href: "/dashboard/logs",
        color: "text-primary",
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/dashboard/settings",
        color: "text-muted-foreground",
    },
    {
        label: "Admin Panel",
        icon: ShieldCheck,
        href: "/admin",
        color: "text-rose-500",
    },
];

interface SideNavProps {
    role?: string;
}

export const SideNav = ({ role }: SideNavProps) => {
    const pathname = usePathname();

    const filteredRoutes = routes.filter(route => {
        if (route.href === "/dashboard/logs" || route.href === "/admin") {
            return role === "ADMIN";
        }
        return true;
    });

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-background/50 backdrop-blur-xl border-r border-border text-card-foreground overflow-y-auto">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold mr-2 shadow-lg shadow-primary/25">
                        S
                    </div>
                    <h1 className={cn("text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400", font.className)}>
                        Scheduler
                    </h1>
                </Link>
                <div className="space-y-1">
                    {filteredRoutes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-r-none rounded-l-lg transition-all",
                                pathname === route.href
                                    ? "bg-gradient-to-r from-primary/20 to-transparent text-primary border-l-2 border-primary"
                                    : "text-muted-foreground hover:bg-accent hover:text-primary"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", pathname === route.href ? "text-primary shadow-primary/50 drop-shadow-md" : "text-muted-foreground group-hover:text-primary")} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2">
                <div className="flex items-center pl-3 mb-4 w-full justify-between gap-2">
                    <UserButton />
                    <ThemeToggle />
                </div>
            </div>
        </div >
    );
};
