"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TermsContent } from "@/components/legal/terms-content";
import { PrivacyContent } from "@/components/legal/privacy-content";
import { CookiesContent } from "@/components/legal/cookies-content";
import { useTranslations } from "next-intl";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ModalProps {
    children: React.ReactNode;
}

export const TermsModal = ({ children }: ModalProps) => {
    const t = useTranslations('Auth');
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{t('termsLink')}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-2 max-h-[60vh]">
                    <TermsContent />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export const PrivacyModal = ({ children }: ModalProps) => {
    const t = useTranslations('Auth');
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{t('privacyLink')}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-2 max-h-[60vh]">
                    <PrivacyContent />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export const CookiesModal = ({ children }: ModalProps) => {
    const t = useTranslations('Landing.footer');
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{t('cookies')}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-2 max-h-[60vh]">
                    <CookiesContent />
                </div>
            </DialogContent>
        </Dialog>
    );
};
