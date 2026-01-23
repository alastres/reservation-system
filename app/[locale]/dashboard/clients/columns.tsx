"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Mail, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations, useFormatter } from "next-intl";

// This type definition must match the data extracted in page.tsx
export type Client = {
    email: string;
    name: string;
    phone: string | null;
    lastBooking: Date;
    totalBookings: number;
    status: string;
}

export const columns: ColumnDef<Client>[] = [
    {
        accessorKey: "name",
        header: function Header({ column }) {
            const t = useTranslations('Clients.table.columns');
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    {t('name')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const name = row.getValue("name") as string;
            const email = row.original.email;

            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary">
                            {name?.[0]?.toUpperCase() || "C"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium">{name}</span>
                        <span className="text-xs text-muted-foreground md:hidden truncate max-w-[150px]">{email}</span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "email",
        header: function Header({ column }) {
            const t = useTranslations('Clients.table.columns');
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    {t('contactInfo')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const email = row.getValue("email") as string;
            const phone = row.original.phone;
            return (
                <div className="flex flex-col space-y-1">
                    <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                        {email}
                    </div>
                    {phone && (
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="mr-2 h-3 w-3" />
                            {phone}
                        </div>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "totalBookings",
        header: function Header({ column }) {
            const t = useTranslations('Clients.table.columns');
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    {t('totalBookings')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            return (
                <div className="flex items-center pl-4">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    {row.getValue("totalBookings")}
                </div>
            )
        }
    },
    {
        accessorKey: "lastBooking",
        header: function Header({ column }) {
            const t = useTranslations('Clients.table.columns');
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    {t('lastVisit')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: function Cell({ row }) {
            const format = useFormatter();
            const date = row.getValue("lastBooking") as Date;
            return <div className="pl-4">{format.dateTime(date, { dateStyle: 'long' })}</div>;
        },
    },
];
