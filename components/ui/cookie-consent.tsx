"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);
    const t = useTranslations('Common'); // Or a specific namespace like 'Legal'

    useEffect(() => {
        const consent = localStorage.getItem("cookie_consent");
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem("cookie_consent", "true");
        setIsVisible(false);
        // Load analytics scripts here if needed
    };

    const declineCookies = () => {
        localStorage.setItem("cookie_consent", "false");
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/80 backdrop-blur-lg border-t border-border shadow-lg"
                >
                    <div className="container max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-muted-foreground text-center md:text-left">
                            <p>
                                Utilizamos cookies para mejorar su experiencia. Al continuar navegando, acepta nuestra{" "}
                                <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                                    Política de Privacidad
                                </Link>{" "}
                                y{" "}
                                <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                                    Términos de Uso
                                </Link>.
                            </p>
                        </div>
                        <div className="flex gap-2 min-w-fit">
                            <Button variant="outline" size="sm" onClick={declineCookies}>
                                Rechazar
                            </Button>
                            <Button size="sm" onClick={acceptCookies}>
                                Aceptar
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
