"use client";

import { useEffect } from "react";
import { updateStripeConnectStatus } from "@/actions/stripe-connect";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function StripeConnectCallback({ status }: { status?: string }) {
    const router = useRouter();

    useEffect(() => {
        if (status === "connect_success") {
            // Update the account status in the database
            updateStripeConnectStatus().then((result) => {
                if (result.error) {
                    toast.error("Error al actualizar el estado de conexión");
                } else {
                    toast.success("¡Cuenta de Stripe conectada exitosamente!");
                }
                // Clean up the URL
                router.replace("/dashboard/settings");
            });
        } else if (status === "connect_refresh") {
            toast.info("Por favor, completa la configuración de tu cuenta de Stripe");
            router.replace("/dashboard/settings");
        }
    }, [status, router]);

    return null;
}
