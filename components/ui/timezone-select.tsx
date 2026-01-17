"use client";

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

const timezones = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Sao_Paulo",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Madrid",
    "Europe/Moscow",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Bangkok",
    "Asia/Shanghai",
    "Asia/Tokyo",
    "Asia/Sydney",
    "Pacific/Auckland",
]

interface TimezoneSelectProps {
    value?: string;
    onChange: (value: string) => void;
}

export function TimezoneSelect({ value, onChange }: TimezoneSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")

    const filteredTimezones = React.useMemo(() => {
        if (!search) return timezones
        return timezones.filter((tz) =>
            tz.toLowerCase().includes(search.toLowerCase())
        )
    }, [search])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                >
                    {value
                        ? timezones.find((tz) => tz === value) || value
                        : "Select timezone..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <div className="p-2 border-b">
                    <div className="flex items-center px-2">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                            placeholder="Search timezone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex h-8 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus-visible:ring-0 px-0"
                        />
                    </div>
                </div>
                <div className="max-h-[200px] overflow-y-auto p-1">
                    {filteredTimezones.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            No timezone found.
                        </div>
                    ) : (
                        filteredTimezones.map((timezone) => (
                            <div
                                key={timezone}
                                className={cn(
                                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors",
                                    value === timezone && "bg-accent text-accent-foreground"
                                )}
                                onClick={() => {
                                    onChange(timezone)
                                    setOpen(false)
                                    setSearch("")
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === timezone ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {timezone}
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
