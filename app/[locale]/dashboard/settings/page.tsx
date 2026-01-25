import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/settings/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Calendar, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { StripeConnectCard } from "@/components/settings/stripe-connect-card";
import { getTranslations, getLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
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
            maxConcurrentClients: true,
            stripeConnectAccountId: true,
            stripeConnectStatus: true,
            stripeCustomerId: true,
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
            <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                    <CardTitle>{t('profile.title')}</CardTitle>
                    <CardDescription>
                        {t('profile.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ProfileForm user={user as any} />
                </CardContent>
            </Card>

            {/* Stripe Connect Section Removed - Moved to /billing */}

            {/* Subscription Section Removed - Moved to /billing */}
        </div>
    );
}
