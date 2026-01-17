import { SideNav } from "@/components/dashboard/side-nav";
import { MobileNav } from "@/components/dashboard/mobile-nav";

const DashboardLayout = ({
    children
}: {
    children: React.ReactNode
}) => {
    return (
        <div className="h-full relative bg-background">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
                <SideNav />
            </div>
            <div className="md:hidden flex items-center p-4 border-b">
                <MobileNav />
                <div className="ml-4 font-semibold">Scheduler</div>
            </div>
            <main className="md:pl-72 h-full">
                {children}
            </main>
        </div>
    );
}

export default DashboardLayout;
