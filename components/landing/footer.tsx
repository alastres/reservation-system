"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { TermsModal, PrivacyModal, CookiesModal } from "@/components/legal/legal-modals";

export const Footer = () => {
    const t = useTranslations("Landing");

    return (
        <footer className="py-12 border-t border-border/40 bg-muted/30 dark:bg-black/40 dark:border-white/10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">
                                S
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">Scheduler</span>
                        </div>
                        <p className="text-muted-foreground max-w-sm">
                            {t('about.desc')}
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">{t('footer.contact')}</h4>
                        <ul className="space-y-2 text-muted-foreground">
                            <li>
                                <a href="mailto:support@scheduler.com" className="hover:text-primary transition-colors">
                                    support@scheduler.com
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">{t('footer.legal')}</h4>
                        <ul className="space-y-2 text-muted-foreground text-sm">
                            <li>
                                <PrivacyModal>
                                    <span className="hover:text-primary transition-colors cursor-pointer">{t('footer.privacy')}</span>
                                </PrivacyModal>
                            </li>
                            <li>
                                <TermsModal>
                                    <span className="hover:text-primary transition-colors cursor-pointer">{t('footer.terms')}</span>
                                </TermsModal>
                            </li>
                            <li>
                                <CookiesModal>
                                    <span className="hover:text-primary transition-colors cursor-pointer">{t('footer.cookies')}</span>
                                </CookiesModal>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-border/40 dark:border-white/5 text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Scheduler. {t('footer.copyright')}
                </div>
            </div>
        </footer>
    );
};
