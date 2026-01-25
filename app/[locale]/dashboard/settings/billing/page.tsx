import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Calendar, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { StripeConnectCard } from "@/components/settings/stripe-connect-card";
import { getTranslations, getLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function SettingsBillingPage() {
    const session = await auth();
    const t = await getTranslations("Settings");
    const locale = await getLocale();
    const dateLocale = locale === 'es' ? es : enUS;

    if (!session?.user?.id) {
        redirect("/auth/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            subscriptionStatus: true,
            subscriptionPlan: true,
            subscriptionEndsAt: true,
            stripeConnectAccountId: true,
            stripeConnectStatus: true,
            stripeCustomerId: true,
            role: true,
        },
    });

    if (!user) {
        redirect("/auth/login");
    }

    const statusColors = {
        ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-500",
        PAST_DUE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-500",
        CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-500",
        INACTIVE: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-500",
        TRIALING: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-500",
    };

    const isAdmin = user.role === "ADMIN";
    const hasSubscription = user.subscriptionPlan !== null;

    return (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {/* Stripe Connect Section */}
            {!isAdmin && user.subscriptionPlan !== "FREE" as any && (
                <div className="col-span-1 md:col-span-2">
                    <StripeConnectCard user={user as any} />
                </div>
            )}

            {/* Subscription Section */}
            {!isAdmin && (
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <div>
                                    <CardTitle>{t('subscription.title')}</CardTitle>
                                    <CardDescription>
                                        {t('subscription.descriptionUser')}
                                    </CardDescription>
                                </div>
                                {hasSubscription && (
                                    <Badge className={statusColors[user.subscriptionStatus as keyof typeof statusColors]}>
                                        {t(`subscription.status.${user.subscriptionStatus}`)}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {hasSubscription ? (
                            <>
                                <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <div>
                                                <p className="text-sm font-medium">{t('subscription.currentPlan')}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {t(`subscription.plans.${user.subscriptionPlan}`)}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {t(`subscription.prices.${user.subscriptionPlan}`)}
                                                </p>
                                            </div>
                                        </div>

                                        {user.subscriptionEndsAt && (
                                            <div className="flex items-start gap-3">
                                                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {user.subscriptionStatus === "CANCELLED" ? t('subscription.expires') : t('subscription.renews')}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {format(new Date(user.subscriptionEndsAt), "d 'de' MMMM, yyyy", { locale: dateLocale })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        {/* Only show "Manage Subscription" if user has a Stripe Customer ID (Paid plans) */}
                                        {user.stripeCustomerId ? (
                                            <form action="/api/subscription/portal" method="POST" className="flex-1">
                                                <Button type="submit" variant="default" className="w-full">
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    {t('subscription.manage')}
                                                </Button>
                                            </form>
                                        ) : (
                                            /* Option to Upgrade / Change Plan */
                                            <Button type="button" variant="outline" className="w-full" asChild>
                                                <a href="/subscription/select">
                                                    {t('subscription.viewPlans')}
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <p className="text-xs text-muted-foreground text-center">
                                    {t('subscription.manageDesc')}
                                </p>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground mb-4">{t('subscription.noActive')}</p>
                                <Button asChild>
                                    <a href="/subscription/select">{t('subscription.viewPlans')}</a>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {isAdmin && (
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle>{t('subscription.title')}</CardTitle>
                        <CardDescription>
                            {t('subscription.descriptionAdmin')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                            <Badge variant="default" className="text-sm">Admin</Badge>
                            <p className="text-sm text-muted-foreground">
                                {t('subscription.adminAccess')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
