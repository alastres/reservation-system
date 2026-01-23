"use client";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { ServiceForm } from "@/components/services/service-form";
import { useTranslations } from "next-intl";

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    service?: any;
    onServiceSaved?: (service: any) => void;
}

export const ServiceModal = ({
    isOpen,
    onClose,
    service,
    onServiceSaved
}: ServiceModalProps) => {
    const t = useTranslations('Services');

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:w-[640px] sm:max-w-[640px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>
                        {service ? t('editService') : t('createService')}
                    </SheetTitle>
                    <SheetDescription>
                        {service ? t('editServiceDesc') : t('createServiceDesc')}
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-8">
                    <ServiceForm
                        service={service}
                        onSuccess={onClose}
                        onServiceSaved={onServiceSaved}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
};
