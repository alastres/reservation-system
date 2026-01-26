import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";

const font = Poppins({
    subsets: ["latin"],
    weight: ["600"],
});

interface HeaderProps {
    label: string;
}

export const Header = ({ label }: HeaderProps) => {
    return (
        <div className="w-full flex flex-col gap-y-4 items-center justify-center">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="font-bold text-white text-xl">S</span>
                </div>
                <h1 className={cn(
                    "text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400",
                    font.className,
                )}>
                    Scheduler
                </h1>
            </div>
            <p className="text-muted-foreground text-sm">
                {label}
            </p>
        </div>
    );
};
