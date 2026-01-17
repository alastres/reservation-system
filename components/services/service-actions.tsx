"use client";

import { Button } from "@/components/ui/button";
import { deleteService } from "@/actions/services";
import { toast } from "sonner";
import { useTransition, useState } from "react";
import { Trash2 } from "lucide-react";

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
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        startTransition(() => {
            deleteService(id).then((data) => {
                if (data.error) toast.error(data.error);
                if (data.success) {
                    toast.success(data.success);
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
                        <DialogTitle>Delete Service</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this service? This action cannot be undone.
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
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isPending}
                        >
                            {isPending ? "Deleting..." : "Delete"}
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
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDuplicate = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        startTransition(() => {
            duplicateService(id).then((data) => {
                if (data.error) toast.error(data.error);
                if (data.success) {
                    toast.success(data.success);
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
            title="Duplicate Service"
        >
            <Copy className="w-4 h-4" />
        </Button>
    );
}

export function ServiceStatusToggle({ id, isActive, onToggle }: { id: string, isActive: boolean, onToggle?: (isActive: boolean) => void }) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = (checked: boolean) => {
        startTransition(() => {
            toggleServiceStatus(id, checked).then((data) => {
                if (data.error) {
                    toast.error(data.error);
                } else {
                    toast.success(data.success);
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
