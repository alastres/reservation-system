"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cancelBooking } from "@/actions/booking";
import { toast } from "sonner";
import { useTransition } from "react";
import { XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function CancelBookingButton({ id }: { id: string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const t = useTranslations("Bookings.cancel");

    const handleCancel = () => {
        console.log("Cancel button clicked for id:", id);
        startTransition(async () => {
            console.log("Calling server action...");
            const result = await cancelBooking(id);
            console.log("Server action result:", result);
            if (result.error) toast.error(result.error);
            if (result.success) {
                toast.success(result.success);
                router.refresh(); // Force UI update
            }
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                    <XCircle className="w-4 h-4 mr-2" />
                    {t('button')}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('description')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {t('confirm')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
