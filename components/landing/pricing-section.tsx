"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import Link from "next/link";

export const PricingSection = () => {
    const t = useTranslations("Landing.pricing");

    return (
        <section id="pricing" className="py-24 relative">
            <div className="absolute inset-0 bg-primary/5 -skew-y-3 transform origin-left scale-110" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">{t('title')}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {["free", "pro", "business"].map((plan, i) => {
                        const isPro = plan === "pro";
                        return (
                            <motion.div
                                key={plan}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className={`
                                    relative p-8 rounded-3xl border 
                                    ${isPro
                                        ? "bg-card/90 border-primary/50 shadow-2xl shadow-primary/10 ring-1 ring-primary/50 dark:bg-black/40"
                                        : "bg-card border-border/50 dark:bg-white/5 dark:border-white/10"
                                    } 
                                    flex flex-col
                                `}
                            >
                                {isPro && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                                        {t('badge')}
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-lg font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                                        {t(`plans.${plan}.title`)}
                                    </h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold">{t(`plans.${plan}.price`)}</span>
                                        <span className="text-muted-foreground">/mo</span>
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {(t.raw(`plans.${plan}.features`) as string[]).map((feature, j) => (
                                        <li key={j} className="flex items-center gap-3">
                                            <div className={`p-1 rounded-full ${isPro ? 'bg-primary/20 text-primary' : 'bg-muted dark:bg-white/10 text-muted-foreground'}`}>
                                                <Check className="w-3 h-3" />
                                            </div>
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className={`w-full py-6 text-base ${isPro ? 'bg-primary hover:bg-primary/90' : 'bg-muted hover:bg-muted/80 dark:bg-white/10 dark:hover:bg-white/20'}`}
                                    variant={isPro ? "default" : "secondary"}
                                    asChild
                                >
                                    <Link href="/auth/register">
                                        {t('cta')}
                                    </Link>
                                </Button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
