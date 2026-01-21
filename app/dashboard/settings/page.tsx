import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/settings/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Calendar, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { StripeConnectCallback } from "@/components/settings/stripe-connect-callback";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ searchParams }: { searchParams: { status?: string } }) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/auth/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            username: true,
            image: true,
            coverImage: true,
            bio: true,
            timeZone: true,
            language: true,
            role: true,
            subscriptionStatus: true,
            subscriptionPlan: true,
            subscriptionEndsAt: true,
            stripeConnectedAccountId: true,
            stripeConnectedAccountStatus: true,
        },
    });

    if (!user) {
        redirect("/auth/login");
    }

    const planNames = {
        MONTHLY: "Plan Mensual",
        QUARTERLY: "Plan Trimestral",
        ANNUAL: "Plan Anual",
    };

    const planPrices = {
        MONTHLY: "€10/mes",
        QUARTERLY: "€25.50/3 meses",
        ANNUAL: "€84/año",
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

    const isAdmin = user.role === "ADMIN";
    const hasSubscription = user.subscriptionPlan !== null;

    return (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <StripeConnectCallback status={searchParams.status} />
            <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                        Update your public profile details and personal information.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ProfileForm user={user as any} />
                </CardContent>
            </Card>

            {/* Subscription Section */}
            {!isAdmin && (
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Suscripción</CardTitle>
                                <CardDescription>
                                    Administra tu plan y método de pago
                                </CardDescription>
                            </div>
                            {hasSubscription && (
                                <Badge className={statusColors[user.subscriptionStatus as keyof typeof statusColors]}>
                                    {statusLabels[user.subscriptionStatus as keyof typeof statusLabels]}
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {hasSubscription ? (
                            <>
                                <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Plan Actual</p>
                                            <p className="text-sm text-muted-foreground">
                                                {planNames[user.subscriptionPlan as keyof typeof planNames]}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {planPrices[user.subscriptionPlan as keyof typeof planPrices]}
                                            </p>
                                        </div>
                                    </div>

                                    {user.subscriptionEndsAt && (
                                        <div className="flex items-start gap-3">
                                            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {user.subscriptionStatus === "CANCELLED" ? "Vence el" : "Próxima Renovación"}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(new Date(user.subscriptionEndsAt), "d 'de' MMMM, yyyy", { locale: es })}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <form action="/api/subscription/portal" method="POST" className="flex-1">
                                        <Button type="submit" variant="default" className="w-full">
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Gestionar Suscripción
                                        </Button>
                                    </form>
                                </div>

                                <p className="text-xs text-muted-foreground text-center">
                                    Puedes cambiar de plan, actualizar tu tarjeta o cancelar tu suscripción desde el portal de gestión
                                </p>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground mb-4">No tienes una suscripción activa</p>
                                <Button asChild>
                                    <a href="/subscription/select">Ver Planes Disponibles</a>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {isAdmin && (
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle>Suscripción</CardTitle>
                        <CardDescription>
                            Información de tu cuenta administrativa
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                            <Badge variant="default" className="text-sm">Admin</Badge>
                            <p className="text-sm text-muted-foreground">
                                Como administrador, tienes acceso completo sin necesidad de suscripción
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stripe Connect Section - For receiving payments */}
            {!isAdmin && (
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle>Pagos y Cobros</CardTitle>
                        <CardDescription>
                            Conecta tu cuenta de Stripe para recibir pagos directamente de tus clientes
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {user.stripeConnectedAccountId ? (
                            <>
                                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400">
                                        {user.stripeConnectedAccountStatus === "active" ? "Conectado" : "Pendiente"}
                                    </Badge>
                                    <p className="text-sm text-muted-foreground">
                                        {user.stripeConnectedAccountStatus === "active"
                                            ? "Tu cuenta de Stripe está conectada y lista para recibir pagos"
                                            : "Completa la configuración de tu cuenta de Stripe para empezar a recibir pagos"
                                        }
                                    </p>
                                </div>
                                {user.stripeConnectedAccountStatus !== "active" && (
                                    <form action="/api/stripe/connect/onboard" method="POST">
                                        <Button type="submit" variant="default" className="w-full">
                                            Completar Configuración
                                        </Button>
                                    </form>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground mb-4">
                                    Conecta tu cuenta de Stripe para recibir pagos por tus servicios
                                </p>
                                <form action="/api/stripe/connect/onboard" method="POST">
                                    <Button type="submit" variant="default">
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Conectar con Stripe
                                    </Button>
                                </form>
                                <p className="text-xs text-muted-foreground mt-4">
                                    Los pagos se transferirán directamente a tu cuenta de Stripe
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
