"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Clock, ShieldCheck, Mail, CalendarX, Smartphone } from "lucide-react";

export const BenefitsSection = () => {
    const t = useTranslations("Landing.benefits");

    const benefits = [
        {
            key: "automation",
            icon: <Clock className="w-6 h-6 text-blue-400" />,
            color: "bg-blue-500/10 text-blue-500"
        },
        {
            key: "availability",
            icon: <CalendarX className="w-6 h-6 text-purple-400" />,
            color: "bg-purple-500/10 text-purple-500"
        },
        {
            key: "reminders",
            icon: <Mail className="w-6 h-6 text-green-400" />,
            color: "bg-green-500/10 text-green-500"
        },
        {
            key: "payments",
            icon: <ShieldCheck className="w-6 h-6 text-amber-400" />,
            color: "bg-amber-500/10 text-amber-500"
        },
        {
            key: "control",
            icon: <Smartphone className="w-6 h-6 text-pink-400" />,
            color: "bg-pink-500/10 text-pink-500"
        }
    ];

    return (
        <section id="features" className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">{t('title')}</h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-500 mx-auto rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {benefits.map((benefit, i) => (
                        <motion.div
                            key={benefit.key}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className={`mb-6 p-4 rounded-2xl w-fit ${benefit.color} group-hover:scale-110 transition-transform duration-300`}>
                                {benefit.icon}
                            </div>

                            <h3 className="text-xl font-bold mb-3 relative z-10">
                                {t(`items.${benefit.key}.title`)}
                            </h3>
                            <p className="text-muted-foreground relative z-10">
                                {t(`items.${benefit.key}.desc`)}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
