"use client";

import { useTranslations } from "next-intl";
import { Brain, Dumbbell, GraduationCap, Briefcase } from "lucide-react";

export const UseCases = () => {
    const t = useTranslations("Landing.useCases");

    const cases = [
        {
            key: "psychologists",
            icon: <Brain className="w-8 h-8 text-pink-400" />
        },
        {
            key: "trainers",
            icon: <Dumbbell className="w-8 h-8 text-blue-400" />
        },
        {
            key: "teachers",
            icon: <GraduationCap className="w-8 h-8 text-yellow-400" />
        },
        {
            key: "consultants",
            icon: <Briefcase className="w-8 h-8 text-green-400" />
        }
    ];

    return (
        <section className="py-24 bg-gradient-to-b from-black/0 via-black/20 to-black/0">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold">{t('title')}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cases.map((item) => (
                        <div key={item.key} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:-translate-y-1">
                            <div className="mb-4 bg-background/50 w-14 h-14 rounded-xl flex items-center justify-center border border-white/10">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-2">{t(`${item.key}.title`)}</h3>
                            <p className="text-muted-foreground text-sm">
                                {t(`${item.key}.features`)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
