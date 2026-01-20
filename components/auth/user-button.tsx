"use client";

import { LogOut } from "lucide-react";
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "@/components/ui/avatar";
import { useCurrentUser } from "@/hooks/use-current-user";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";

export const UserButton = () => {
    const user = useCurrentUser();

    return (
        <div className="flex items-center w-full justify-between gap-x-2">
            <div className="flex items-center gap-x-2">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.image || ""} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <p className="text-sm font-medium text-foreground truncate max-w-[120px]">
                        {user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {user?.email}
                    </p>
                </div>
            </div>
            <LogoutButton variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors">
                <LogOut className="h-4 w-4" />
            </LogoutButton>
        </div>
    );
};
