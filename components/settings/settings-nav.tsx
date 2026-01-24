"use client";

import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { useTranslations } from "next-intl";

export const SettingsNav = () => {
    const pathname = usePathname();
    const t = useTranslations("Settings.nav");

    const items = [
        {
            title: t('profile'),
            href: "/dashboard/settings",
            isActive: pathname === "/dashboard/settings"
        },
        {
            title: t('integrations'),
            href: "/dashboard/settings/integrations",
            isActive: pathname === "/dashboard/settings/integrations"
        }
    ];

    return (
        <nav className="flex space-x-2 lg:space-x-4 border-b pb-2 mb-6 overflow-x-auto">
            {items.map((item) => (
                <Link key={item.href} href={item.href}>
                    <Button
                        variant={item.isActive ? "default" : "ghost"}
                        className={cn(
                            "justify-start transition-colors px-4 py-2 h-9",
                            !item.isActive && "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                    >
                        {item.title}
                    </Button>
                </Link>
            ))}
        </nav>
    );
}
