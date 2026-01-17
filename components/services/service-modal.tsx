"use client";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { ServiceForm } from "@/components/services/service-form";

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
    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:w-[640px] sm:max-w-[640px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>
                        {service ? "Edit Service" : "Create Service"}
                    </SheetTitle>
                    <SheetDescription>
                        {service ? "Make changes to your service details below." : "Add a new service to your offerings."}
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
