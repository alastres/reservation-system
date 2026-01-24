"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ShieldAlert, Timer } from "lucide-react";
import { useTranslations } from "next-intl";

export default function TooManyRequestsPage() {
    const t = useTranslations('ErrorPages.TooManyRequests');

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 w-full h-full bg-dotted-pattern/10 -z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl -z-10" />

            <div className="relative z-10 text-center max-w-lg mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">

                <div className="flex justify-center mb-8">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full group-hover:bg-red-500/30 transition-all duration-500" />
                        <div className="relative bg-background p-6 rounded-2xl border shadow-lg ring-1 ring-red-500/10">
                            <ShieldAlert className="h-16 w-16 text-red-500" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                        {t('title')}
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        {t.rich('description', {
                            br: () => <br />
                        })}
                    </p>
                </div>

                {/* Status Card */}
                <div className="bg-muted/30 p-4 rounded-xl border border-border/50 backdrop-blur-sm max-w-sm mx-auto my-6">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground justify-center">
                        <Timer className="w-4 h-4 animate-pulse" />
                        <span>{t('status')}</span>
                    </div>
                </div>

                <div className="pt-4">
                    <Button asChild size="lg" variant="default" className="gap-2 min-w-[200px] h-12 shadow-xl shadow-red-500/10 transition-all hover:scale-105">
                        <Link href="/">
                            <Home className="w-4 h-4" />
                            {t('returnHome')}
                        </Link>
                    </Button>
                </div>
            </div>


        </div>
    );
}
