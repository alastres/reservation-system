"use client";

import { useTranslations } from "next-intl";
import { Quote } from "lucide-react";

export const Testimonials = () => {
    const t = useTranslations("Landing.testimonials");

    return (
        <section className="py-24 bg-black/30">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">{t('title')}</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {['t1', 't2', 't3'].map((key, i) => (
                        <div key={key} className="p-8 rounded-2xl bg-white/5 border border-white/10 relative">
                            <Quote className="absolute top-6 right-6 w-8 h-8 text-white/10" />
                            <div className="mb-6">
                                <div className="flex gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <div key={star} className="w-4 h-4 rounded-full bg-yellow-500/80" />
                                    ))}
                                </div>
                            </div>
                            <p className="text-lg mb-6 italic text-muted-foreground">
                                "{t(`${key}.quote`)}"
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600" />
                                <div>
                                    <p className="font-bold">{t(`${key}.author`)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
