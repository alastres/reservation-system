import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

async function getSubscriptionInfo(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            subscriptionStatus,
            subscriptionPlan,
            subscriptionEndsAt,
            stripeCustomerId,
        },
    });

    return user;
}

export default async function ManageSubscriptionPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/auth/login");
    }

    const subscription = await getSubscriptionInfo(session.user.id);

    if (!subscription) {
        redirect("/subscription/select");
    }

    const planNames = {
        MONTHLY: "Plan Mensual",
        QUARTERLY: "Plan Trimestral",
        ANNUAL: "Plan Anual",
    };

    const planPrices = {
        MONTHLY: "€10/mes",
        QUARTERLY: "€25.50/3 meses (€8.50/mes)",
        ANNUAL: "€84/año (€7/mes)",
    };

    const statusColors = {
        ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-500",
        PAST_DUE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-500",
        CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-500",
        INACTIVE: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-500",
        TRIALING: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-500",
    };

    const statusLabels = {
        ACTIVE: "Activa",
        PAST_DUE: "Pago Pendiente",
        CANCELLED: "Cancelada",
        INACTIVE: "Inactiva",
        TRIALING: "Período de Prueba",
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Mi Suscripción</h1>
                    <p className="text-muted-foreground">
                        Administra tu plan y métodos de pago
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Estado de la Suscripción</CardTitle>
                            <Badge className={statusColors[subscription.subscriptionStatus]}>
                                {statusLabels[subscription.subscriptionStatus]}
                            </Badge>
                        </div>
                        <CardDescription>
                            {subscription.subscriptionPlan
                                ? planNames[subscription.subscriptionPlan]
                                : "Sin plan activo"}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {subscription.subscriptionPlan && (
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Plan Actual</p>
                                        <p className="text-sm text-muted-foreground">
                                            {planPrices[subscription.subscriptionPlan]}
                                        </p>
                                    </div>
                                </div>

                                {subscription.subscriptionEndsAt && (
                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Próxima Renovación</p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(new Date(subscription.subscriptionEndsAt), "d 'de' MMMM, yyyy", {
                                                    locale: es,
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {subscription.subscriptionStatus === "PAST_DUE" && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/20 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                                            Pago Pendiente
                                        </p>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                            Tu último pago no se pudo procesar. Por favor actualiza tu método de pago.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3">
                            <form action="/api/subscription/portal" method="POST" className="flex-1">
                                <Button type="submit" className="w-full">
                                    Gestionar Suscripción
                                </Button>
                            </form>
                            <Button asChild variant="outline" className="flex-1">
                                <a href="/dashboard">Volver al Panel</a>
                            </Button>
                        </div>

                        <p className="text-xs text-center text-muted-foreground">
                            Gestiona tu suscripción incluye: cambiar plan, actualizar tarjeta, cancelar suscripción
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Beneficios de tu Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span>
                                Servicios ilimitados
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span>
                                Reservas ilimitadas
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span>
                                Integración con Google Calendar
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span>
                                Notificaciones por email
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span>
                                Soporte prioritario
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
