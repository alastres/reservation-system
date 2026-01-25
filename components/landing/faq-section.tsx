"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Plus, Minus } from "lucide-react";

export const FAQSection = () => {
    const t = useTranslations("Landing.faq");
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const questions = ["q1", "q2", "q3", "q4"];

    return (
        <section id="faq" className="py-24">
            <div className="container mx-auto px-6 max-w-3xl">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('title')}</h2>

                <div className="space-y-4">
                    {questions.map((q, i) => (
                        <div key={q} className="border border-white/10 rounded-xl bg-white/5 overflow-hidden">
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                            >
                                <span className="font-medium text-lg">{t(`${q}.q`)}</span>
                                {openIndex === i ? (
                                    <Minus className="w-5 h-5 text-primary" />
                                ) : (
                                    <Plus className="w-5 h-5 text-muted-foreground" />
                                )}
                            </button>
                            <AnimatePresence>
                                {openIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="px-6 pb-6 text-muted-foreground">
                                            {t(`${q}.a`)}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
