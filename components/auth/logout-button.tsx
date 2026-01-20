"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
    children?: React.ReactNode;
}

export const LogoutButton = ({
    variant = "ghost",
    size = "default",
    className,
    children
}: LogoutButtonProps) => {
    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={() => signOut({ callbackUrl: "/" })}
        >
            {children || (
                <>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                </>
            )}
        </Button>
    );
};
