import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function SubscriptionSuccessPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ session_id?: string }>;
}) {
    const session = await auth();
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'subscription.success' });
    const { session_id } = await searchParams;

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

                    {/* Branding Logo */}
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">
                            S
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
                            Scheduler
                        </span>
                    </div>

                    <CardTitle className="text-2xl">{t('title')}</CardTitle>
                    <CardDescription>
                        {t('description')}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                        <p className="text-sm">
                            <strong>{t('welcome')}</strong>
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {t('welcomeDesc')}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Button asChild className="w-full">
                            <a href="/dashboard">{t('goToDashboard')}</a>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                            <a href="/subscription/manage">{t('viewSubscription')}</a>
                        </Button>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                        {t('emailConfirmation')}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
