"use client";

import { Button } from "@/components/ui/button";
import { deleteService } from "@/actions/services";
import { toast } from "sonner";
import { useTransition, useState } from "react";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteServiceButton({ id, onDelete }: { id: string, onDelete?: (id: string) => void }) {
    const t = useTranslations('Services');
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        startTransition(() => {
            deleteService(id).then((data) => {
                if (data.error) toast.error(data.error);
                if (data.success) {
                    toast.success(t('status.deleted'));
                    setOpen(false);
                    if (onDelete) {
                        onDelete(id);
                    }
                }
            });
        });
    };

    return (
        <div onClick={(e) => e.stopPropagation()}>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={isPending}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('deleteService')}</DialogTitle>
                        <DialogDescription>
                            {t('deleteConfirmation')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpen(false);
                            }}
                            disabled={isPending}
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isPending}
                        >
                            {isPending ? t('deleting') : t('delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

import { Copy, Power } from "lucide-react";
import { duplicateService, toggleServiceStatus } from "@/actions/services";
import { Switch } from "@/components/ui/switch";

import { useRouter } from "next/navigation";

export function DuplicateServiceButton({ id, onDuplicate }: { id: string, onDuplicate?: (service: any) => void }) {
    const t = useTranslations('Services');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDuplicate = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        startTransition(() => {
            duplicateService(id).then((data) => {
                if (data.error) toast.error(data.error);
                if (data.success) {
                    toast.success(t('status.duplicated'));
                    router.refresh();
                    if (onDuplicate && data.service) {
                        onDuplicate(data.service);
                    }
                }
            });
        });
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleDuplicate}
            disabled={isPending}
            title={t('duplicate')}
        >
            <Copy className="w-4 h-4" />
        </Button>
    );
}

export function ServiceStatusToggle({ id, isActive, onToggle }: { id: string, isActive: boolean, onToggle?: (isActive: boolean) => void }) {
    const t = useTranslations('Services');
    const [isPending, startTransition] = useTransition();

    const handleToggle = (checked: boolean) => {
        startTransition(() => {
            toggleServiceStatus(id, checked).then((data) => {
                if (data.error) {
                    toast.error(data.error);
                } else {
                    toast.success(t('status.toggled'));
                    if (onToggle) {
                        onToggle(checked);
                    }
                }
            });
        });
    };

    return (
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
            <Switch
                checked={isActive}
                onCheckedChange={handleToggle}
                disabled={isPending}
            />
        </div>
    );
}
