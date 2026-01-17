"use client";

import { Button } from "@/components/ui/button";
import { cancelBooking } from "@/actions/booking";
import { toast } from "sonner";
import { useTransition } from "react";
import { XCircle } from "lucide-react";

export function CancelBookingButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();

    const handleCancel = () => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;

        startTransition(() => {
            cancelBooking(id).then((data) => {
                if (data.error) toast.error(data.error);
                if (data.success) toast.success(data.success);
            });
        });
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isPending}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
            <XCircle className="w-4 h-4 mr-2" />
            Cancel
        </Button>
    );
}
