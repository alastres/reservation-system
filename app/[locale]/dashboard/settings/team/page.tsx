import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserPlan } from "@/actions/user";
import { redirect } from "next/navigation";

export default async function TeamSettingsPage() {
    // Basic server-side protection
    const plan = await getUserPlan();
    if (plan !== "BUSINESS") {
        // Option A: Redirect
        // redirect("/dashboard/settings");
        // Option B: Show upgrade message
    }

    // Client component for translations would be better, but server component is fine for structure
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Team Management</CardTitle>
                    <CardDescription>
                        Manage your organization members and roles. (Available on Business Plan)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {plan === "BUSINESS" ? (
                        <div className="p-4 bg-muted rounded-md border text-center">
                            <p>Team management features coming soon!</p>
                            {/* Placeholder for member list */}
                        </div>
                    ) : (
                        <div className="p-4 bg-yellow-50/10 border border-yellow-500/20 rounded-md text-yellow-500">
                            Upgrade to Business plan to access team features.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
