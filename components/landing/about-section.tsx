"use client";

import { useTranslations } from "next-intl";
import { Users } from "lucide-react";

export const AboutSection = () => {
    const t = useTranslations("Landing.about");

    return (
        <section id="about" className="py-24 bg-gradient-to-t from-muted/50 via-background to-background dark:from-background dark:to-black/20 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,black,transparent)] dark:[mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10 max-w-4xl">
                <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8 text-primary border border-primary/20">
                        <Users className="w-8 h-8" />
                    </div>

                    <h2 className="text-3xl md:text-5xl font-bold mb-8">{t('title')}</h2>
                </div>

                <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                    <p>{t('intro')}</p>

                    <p>{t('mission')}</p>

                    <div className="py-2">
                        <h3 className="text-xl font-semibold text-foreground mb-4">{t('beliefsTitle')}</h3>
                        <ul className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                            {t('beliefs').split('|').map((belief, i) => (
                                <li key={i} className="flex items-center gap-2 bg-card/50 p-3 rounded-lg border border-border/50">
                                    <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                    <span>{belief.trim()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <p>{t('goal')}</p>

                    <p className="font-medium text-foreground">{t('closing')}</p>
                </div>

                <div className="mt-12 flex items-center justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {/* Placeholder logic for team faces or logos if needed later */}
                </div>
            </div>
        </section>
    );
};
