import { getUserByUsername } from "@/data/user";
import { notFound } from "next/navigation";
import { AutoRefresh } from "@/components/auto-refresh";
import { ProfileContent } from "@/components/profile/profile-content";
import { getTranslations } from "next-intl/server";

export const revalidate = 0;

interface PublicProfileProps {
    params: Promise<{ username: string }>;
}

const PublicProfilePage = async ({ params }: PublicProfileProps) => {
    const { username } = await params;
    const user = await getUserByUsername(username);
    const t = await getTranslations("Profile");

    if (!user) return notFound();

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col pb-16 relative overflow-hidden text-white">
            {/* Decorative background blobs - vivid colors for dark mode */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-4000"></div>

            <ProfileContent user={user} />

            <AutoRefresh />

            <div className="mt-auto pt-16 text-slate-600 text-sm text-center z-10">
                {t("poweredBy")} <span className="font-bold text-slate-500">Reservation System</span>
            </div>
        </div>
    );
}

export default PublicProfilePage;
