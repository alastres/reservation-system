"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Settings, Share2, CalendarCheck } from "lucide-react";

export const HowItWorks = () => {
    const t = useTranslations("Landing.howItWorks");

    const steps = [
        {
            key: "step1",
            icon: <Settings className="w-8 h-8" />
        },
        {
            key: "step2",
            icon: <Share2 className="w-8 h-8" />
        },
        {
            key: "step3",
            icon: <CalendarCheck className="w-8 h-8" />
        }
    ];

    return (
        <section className="py-24 bg-black/20 relative">
            <div className="container mx-auto px-6">
                <div className="text-center mb-20">
                    <span className="text-primary font-semibold tracking-wider uppercase text-sm mb-4 block">
                        {t('subtitle')}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold">{t('title')}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-[60px] left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />

                    {steps.map((step, i) => (
                        <motion.div
                            key={step.key}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.2 }}
                            viewport={{ once: true }}
                            className="relative flex flex-col items-center text-center"
                        >
                            <div className="w-32 h-32 rounded-full bg-background border border-border flex items-center justify-center relative z-10 shadow-2xl mb-8 group overflow-hidden">
                                <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors" />
                                <div className="text-primary group-hover:scale-110 transition-transform duration-300">
                                    {step.icon}
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg border-4 border-background">
                                    {i + 1}
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold mb-4">{t(`${step.key}.title`)}</h3>
                            <p className="text-muted-foreground max-w-xs leading-relaxed">
                                {t(`${step.key}.desc`)}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
