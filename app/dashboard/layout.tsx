import { SideNav } from "@/components/dashboard/side-nav";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

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
        where: { id: session.user.id }
    });

    if (!user || !user.emailVerified) {
        redirect("/auth/new-verification");
    }

    return (
        <div className="h-full relative bg-background">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
                <SideNav role={(user as any).role} />
            </div>
            <div className="md:hidden flex items-center p-4 border-b">
                <MobileNav role={(user as any).role} />
                <div className="ml-4 font-semibold">Scheduler</div>
            </div>
            <main className="md:pl-72 h-full">
                {children}
            </main>
        </div>
    );
}

export default DashboardLayout;
