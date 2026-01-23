"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createConnectAccount, getConnectStatus, disconnectStripeAccount } from "@/actions/stripe-connect";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export function StripeConnectCard({ user }: { user: any }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [connectData, setConnectData] = useState<any>(null);
    const searchParams = useSearchParams();
    const router = useRouter();

    const isRefresh = searchParams.get("stripe_connect") === "refresh";
    const isReturn = searchParams.get("stripe_connect") === "return";

    // Initial Status Check
    useEffect(() => {
        const checkStatus = async () => {
            setIsChecking(true);
            try {
                const res = await getConnectStatus();
                setConnectData(res);
                if (res.connected) {
                    if (isReturn) {
                        toast.success("Account connected successfully!");
                        // clear URL params
                        router.replace("/dashboard/settings");
                    }
                } else if (isReturn) {
                    toast.warning("Account setup incomplete.");
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsChecking(false);
            }
        };

        checkStatus();
    }, [isReturn, router]);

    const handleConnect = async () => {
        setIsLoading(true);
        try {
            const res = await createConnectAccount();
            if (res.url) {
                window.location.href = res.url;
            } else {
                toast.error(res.error || "Failed to start onboarding");
            }
        } catch (e) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm("Are you sure? This will prevent you from receiving payments.")) return;

        setIsLoading(true);
        try {
            await disconnectStripeAccount();
            setConnectData(null);
            toast.success("Disconnected successfully");
        } catch (e) {
            toast.error("Failed to disconnect");
        } finally {
            setIsLoading(false);
        }
    };

    const isConnected = connectData?.connected; // Based on getConnectStatus logic
    // Or prefer user.stripeConnectStatus if available from props, but getConnectStatus verifies real-time?
    // Let's use real-time data from hook for accuracy on return.

    // Fallback ID from user prop if not yet fetched
    const hasAccountId = user.stripeConnectAccountId;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Pagos y Stripe Connect</CardTitle>
                        <CardDescription>
                            Conecta tu cuenta de Stripe para recibir pagos de tus clientes directamente.
                        </CardDescription>
                    </div>
                    {connectData?.connected && (
                        <Badge variant="default" className="bg-green-600">Activo</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {isChecking ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Checking status...
                    </div>
                ) : isConnected ? (
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-green-900 dark:text-green-400">Cuenta Conectada</h4>
                                <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                                    Tu cuenta de Stripe está lista para recibir pagos.
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    ID: {user.stripeConnectAccountId}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleConnect}> {/* Re-onboarding often handles dashboard login link or update */}
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Configuración Stripe
                            </Button>

                            <Button variant="destructive" onClick={handleDisconnect} disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Desconectar"}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                            <h4 className="font-medium mb-2">Recibe pagos por tus servicios</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                                Para cobrar por tus citas (ej. pago por adelantado), necesitas conectar una cuenta de Stripe.
                                Los fondos se transferirán directamente a tu cuenta bancaria configurada en Stripe.
                            </p>

                            <Button onClick={handleConnect} disabled={isLoading} className="w-full sm:w-auto">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Conectando...
                                    </>
                                ) : (
                                    "Conectar con Stripe"
                                )}
                            </Button>
                        </div>
                        {hasAccountId && !isConnected && (
                            <div className="flex items-center gap-2 text-yellow-600 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                <span>Configuración incompleta. Por favor continúa la conexión.</span>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
