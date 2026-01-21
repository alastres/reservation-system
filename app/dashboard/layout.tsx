import { SideNav } from "@/components/dashboard/side-nav";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import { cn } from "@/lib/utils";

const font = Plus_Jakarta_Sans({ weight: "600", subsets: ["latin"] });

const DashboardLayout = async ({
    children
}: {
    children: React.ReactNode
}) => {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/auth/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            emailVerified: true,
            role: true,
            subscriptionStatus: true,
            id: true,
        },
    });

    if (!user || !user.emailVerified) {
        redirect("/auth/new-verification");
    }

    // Check if user is first admin (count all users)
    const isFirstUser = await prisma.user.count() === 1;

    // Subscription check: Allow access if ADMIN, first user, or has ACTIVE subscription
    const hasActiveSubscription = user.subscriptionStatus === "ACTIVE";
    const isAdmin = user.role === "ADMIN";

    if (!isAdmin && !isFirstUser && !hasActiveSubscription) {
        redirect("/subscription/select");
    }

    return (
        <div className="h-full relative bg-background">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
                <SideNav role={(user as any).role} />
            </div>
            <div className="md:hidden flex items-center p-4 border-b">
                <MobileNav role={(user as any).role} />
                <div className="flex items-center ml-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold mr-2 shadow-lg shadow-primary/25">
                        S
                    </div>
                    <h1 className={cn("text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400", font.className)}>
                        Scheduler
                    </h1>
                </div>
            </div>
            <main className="md:pl-72 h-full">
                {children}
            </main>
        </div>
    );
}

export default DashboardLayout;
