import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default async function SubscriptionSuccessPage({
    searchParams,
}: {
    searchParams: { session_id?: string };
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/login");
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-500" />
                    </div>
                    <CardTitle className="text-2xl">¡Suscripción Activada!</CardTitle>
                    <CardDescription>
                        Tu cuenta ha sido activada con éxito
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                        <p className="text-sm">
                            <strong>¡Bienvenido a reserva24.com!</strong>
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Ya puedes empezar a crear servicios, gestionar tu disponibilidad y recibir reservas.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Button asChild className="w-full">
                            <a href="/dashboard">Ir al Panel de Control</a>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                            <a href="/subscription/manage">Ver Mi Suscripción</a>
                        </Button>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                        Recibirás un email de confirmación en breve
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
