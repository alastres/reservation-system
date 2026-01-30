import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserPlan } from "@/actions/user";

export default async function TeamSettingsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Settings.team' });

    // Basic server-side protection
    const planData = await getUserPlan();
    const plan = planData?.plan;

    // If redirection was needed:
    // if (plan !== "BUSINESS") { ... }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                    <CardDescription>
                        {t('description')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {plan === "BUSINESS" ? (
                        <div className="p-4 bg-muted rounded-md border text-center">
                            <p>{t('comingSoon')}</p>
                            {/* Placeholder for member list */}
                        </div>
                    ) : (
                        <div className="p-4 bg-yellow-50/10 border border-yellow-500/20 rounded-md text-yellow-500">
                            {t('upgradeRequired')}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
