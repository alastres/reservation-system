"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

export const HeroSection = () => {
    const t = useTranslations("Landing.hero");

    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[500px] bg-primary/20 blur-[120px] rounded-full opacity-50 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="container mx-auto relative z-10 text-center max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary mb-8 backdrop-blur-sm"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        {t('badge')}
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                        {t('title')} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                            {t('titleHighlight')}
                        </span>
                    </h1>

                    <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                        {t('subtitle')}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <Button size="lg" className="h-12 px-8 text-base rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow" asChild>
                            <Link href="/auth/register">
                                {t('ctaPrimary')} <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-full border-white/10 hover:bg-white/5 backdrop-blur-sm" asChild>
                            <Link href="/auth/login?action=demo">
                                {t('ctaSecondary')}
                            </Link>
                        </Button>
                    </div>

                    <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className={`w-8 h-8 rounded-full border-2 border-background bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold z-[${5 - i}]`}>
                                    {i === 4 ? '+' : ''}
                                </div>
                            ))}
                        </div>
                        <p>{t('users')}</p>
                    </div>
                </motion.div>

                {/* Visual Mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="mt-20 relative mx-auto max-w-6xl perspective-1000"
                >
                    <div className="relative rounded-xl border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl p-2 md:p-4 rotate-x-12 transform-gpu hover:rotate-x-0 transition-transform duration-700 ease-out">
                        <div className="rounded-lg overflow-hidden bg-background aspect-[16/10] relative border border-white/5 shadow-inner">
                            {/* Detailed Mockup Placeholder - In a real app, use an image here */}
                            <div className="absolute inset-0 bg-muted/20 flex flex-col">
                                {/* Mock Header */}
                                <div className="h-14 border-b border-border/50 flex items-center px-6 gap-4 bg-background/50">
                                    <div className="w-4 h-4 rounded-full bg-red-400/20"></div>
                                    <div className="w-4 h-4 rounded-full bg-yellow-400/20"></div>
                                    <div className="w-4 h-4 rounded-full bg-green-400/20"></div>
                                    <div className="ml-auto w-24 h-8 rounded-md bg-muted"></div>
                                </div>
                                {/* Mock Content */}
                                <div className="flex-1 flex">
                                    <div className="w-64 border-r border-border/50 p-4 space-y-3 hidden md:block">
                                        <div className="w-full h-8 rounded bg-primary/10"></div>
                                        <div className="w-full h-8 rounded bg-muted"></div>
                                        <div className="w-full h-8 rounded bg-muted"></div>
                                    </div>
                                    <div className="flex-1 p-6 grid grid-cols-7 gap-px bg-muted/30">
                                        {Array.from({ length: 35 }).map((_, i) => (
                                            <div key={i} className="bg-background h-24 rounded-sm relative group p-2">
                                                {i === 10 && (
                                                    <div className="absolute inset-1 bg-primary/20 rounded border border-primary/30 flex items-center justify-center text-primary text-xs font-bold">
                                                        Meeting
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-20" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
