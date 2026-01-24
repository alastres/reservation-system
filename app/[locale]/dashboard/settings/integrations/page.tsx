import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { connectGoogle, disconnectGoogle } from "@/actions/integrations";
import { CalendarCheck, XCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
    const session = await auth();
    const t = await getTranslations("Settings.integrations");

    if (!session?.user?.id) {
        redirect("/auth/login");
    }

    const googleAccount = await prisma.account.findFirst({
        where: {
            userId: session.user.id,
            provider: "google"
        }
    });

    const isConnected = !!googleAccount;

    return (
        <div className="grid gap-4 grid-cols-1">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarCheck className="w-5 h-5 text-blue-500" />
                        {t('googleCalendar')}
                    </CardTitle>
                    <CardDescription>
                        {t('description')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
                            <div className="space-y-1">
                                <p className="font-medium text-sm">
                                    {isConnected ? t('connected') : t('notConnected')}
                                </p>
                                {isConnected && (
                                    <p className="text-xs text-muted-foreground">
                                        {t('synced')}
                                    </p>
                                )}
                            </div>
                        </div>

                        {isConnected ? (
                            <form action={disconnectGoogle}>
                                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                    <XCircle className="w-4 h-4 mr-2" />
                                    {t('disconnect')}
                                </Button>
                            </form>
                        ) : (
                            <form action={connectGoogle}>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                    {t('connect')}
                                </Button>
                            </form>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

