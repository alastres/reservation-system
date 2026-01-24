"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, SearchX } from "lucide-react";
import { useTranslations } from "next-intl";

export default function NotFound() {
    const t = useTranslations('ErrorPages.NotFound');
    const tCommon = useTranslations('ErrorPages'); // Fallback or dedicated namespace

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 w-full h-full bg-grid-black/[0.02] dark:bg-grid-white/[0.02] -z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />

            <div className="relative z-10 text-center max-w-md mx-auto space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                        <div className="relative bg-background p-4 rounded-full border shadow-sm">
                            <SearchX className="h-12 w-12 text-primary" />
                        </div>
                    </div>
                </div>

                <h1 className="text-8xl font-black text-primary/20 select-none">404</h1>

                <div className="space-y-2 -mt-12 relative z-20">
                    <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
                    <p className="text-muted-foreground text-lg">
                        {t('description')}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                    <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/20">
                        <Link href="/dashboard">
                            <Home className="w-4 h-4" />
                            {t('returnHome')}
                        </Link>
                    </Button>
                </div>
            </div>


        </div>
    );
}
