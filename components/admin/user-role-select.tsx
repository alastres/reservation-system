"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Role } from "@prisma/client";
import { toast } from "sonner";
import { updateUserRole } from "@/actions/admin";
import { useState } from "react";

interface UserRoleSelectProps {
    userId: string;
    currentRole: Role;
    currentUserEmail?: string;
}

export function UserRoleSelect({ userId, currentRole, currentUserEmail }: UserRoleSelectProps) {
    const [role, setRole] = useState<Role>(currentRole);
    const [loading, setLoading] = useState(false);

    const handleValueChange = async (value: Role) => {
        setLoading(true);
        // Optimistic update
        setRole(value);

        try {
            const result = await updateUserRole(userId, value);
            if (result.error) {
                toast.error(result.error);
                setRole(currentRole); // Revert
            } else {
                toast.success("User role updated");
            }
        } catch (error) {
            toast.error("Something went wrong");
            setRole(currentRole); // Revert
        } finally {
            setLoading(false);
        }
    };

    // Prevent changing own role (basic safety, backend should also enforce if strictly needed, 
    // but usually admins CAN demote themselves, though risky)

    return (
        <Select
            value={role}
            onValueChange={handleValueChange}
            disabled={loading}
        >
            <SelectTrigger className="w-[110px] h-8 text-xs bg-white/5 border-white/10 text-slate-200 focus:ring-indigo-500/50">
                <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="OWNER">Owner</SelectItem>
                <SelectItem value="CLIENT">Client</SelectItem>
            </SelectContent>
        </Select>
    );
}
