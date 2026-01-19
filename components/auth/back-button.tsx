"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
    href: string;
    label: string;
};

export const BackButton = ({
    href,
    label,
}: BackButtonProps) => {
    if (!label) {
        return null; // Return null if no label is provided
    }

    return (
        <Button
            variant="link"
            className="font-normal w-full"
            size="sm"
            asChild
        >
            <Link href={href}>
                {label}
            </Link>
        </Button>
    );
};
