import { AvailabilityForm } from "@/components/availability/availability-form";
import { DateOverride } from "@/components/availability/date-override";
import { getAvailability, getExceptions } from "@/actions/availability";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

const AvailabilityPage = async () => {
    const session = await auth();
    if (!session?.user) redirect("/auth/login");

    const availability = await getAvailability();
    const exceptions = await getExceptions();
    const t = await getTranslations("Availability");

    return (
        <div className="flex-1 space-y-4 p-8 pt-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between space-y-2 mb-6">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                    {t('title')}
                </h2>
            </div>

            <AvailabilityForm initialData={availability} />
            <DateOverride initialExceptions={exceptions} />
        </div>
    );
}

export default AvailabilityPage;
