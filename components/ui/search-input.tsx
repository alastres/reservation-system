"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";


interface SearchInputProps {
    placeholder?: string;
    className?: string;
}

export function SearchInput({ placeholder = "Search...", className }: SearchInputProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [value, setValue] = useState(searchParams.get("search") || "");

    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set("search", value);
            } else {
                params.delete("search");
            }
            // Reset to page 1 on search
            params.set("page", "1");
            router.push(`?${params.toString()}`);
        }, 500);

        return () => clearTimeout(timer);
    }, [value, router, searchParams]);

    return (
        <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder={placeholder}
                className={`pl-9 ${className}`}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
        </div>
    );
}
