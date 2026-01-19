import { SettingsNav } from "@/components/settings/settings-nav";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/login");
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                    Settings
                </h2>
            </div>
            <SettingsNav />
            <div className="lg:max-w-4xl">
                {children}
            </div>
        </div>
    );
}
