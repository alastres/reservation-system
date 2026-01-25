"use client";

import { useTranslations } from "next-intl";
import { Users } from "lucide-react";

export const AboutSection = () => {
    const t = useTranslations("Landing.about");

    return (
        <section id="about" className="py-24 bg-gradient-to-t from-background to-black/20 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8 text-primary border border-primary/20">
                    <Users className="w-8 h-8" />
                </div>

                <h2 className="text-3xl md:text-5xl font-bold mb-8">{t('title')}</h2>

                <p className="text-xl text-muted-foreground leading-relaxed">
                    {t('desc')}
                </p>

                <div className="mt-12 flex items-center justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {/* Placeholder logic for team faces or logos if needed later */}
                </div>
            </div>
        </section>
    );
};
