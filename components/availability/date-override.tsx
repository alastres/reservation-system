"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Trash2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveException, deleteException } from "@/actions/availability";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AvailabilityException {
    id: string;
    date: Date;
    isAvailable: boolean;
    startTime: string | null;
    endTime: string | null;
}

interface DateOverrideProps {
    initialExceptions: AvailabilityException[];
}

export function DateOverride({ initialExceptions }: DateOverrideProps) {
    const [date, setDate] = useState<Date>();
    const [isAvailable, setIsAvailable] = useState(false);
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("17:00");
    const [isPending, startTransition] = useTransition();
    const t = useTranslations("Availability.override");

    const handleAdd = () => {
        if (!date) return;

        startTransition(() => {
            saveException(date, isAvailable, isAvailable ? startTime : undefined, isAvailable ? endTime : undefined)
                .then((data) => {
                    if (data.error) toast.error(t('toast.error'));
                    if (data.success) {
                        toast.success(t('toast.added'));
                        setDate(undefined); // Reset
                    }
                });
        });
    };

    const handleDelete = (id: string) => {
        startTransition(() => {
            deleteException(id).then((data) => {
                if (data.error) toast.error(t('toast.error'));
                if (data.success) toast.success(t('toast.deleted'));
            });
        });
    };

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end border p-4 rounded-lg bg-muted/20">
                    <div className="space-y-2 flex-1">
                        <Label>{t('selectDate')}</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>{t('pickDate')}</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2 flex flex-col items-center">
                        <Label className="mb-2">{t('available')}</Label>
                        <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
                    </div>

                    {isAvailable && (
                        <>
                            <div className="space-y-2">
                                <Label>{t('startTime')}</Label>
                                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('endTime')}</Label>
                                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                            </div>
                        </>
                    )}

                    <Button onClick={handleAdd} disabled={!date || isPending}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('add')}
                    </Button>
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground">{t('active')}</h3>
                    {initialExceptions.length === 0 && <p className="text-sm text-muted-foreground italic">{t('empty')}</p>}

                    <div className="grid gap-3">
                        {initialExceptions.map((ex) => (
                            <div key={ex.id} className="flex items-center justify-between p-3 border rounded-md bg-card">
                                <div className="flex items-center gap-4">
                                    <span className="font-medium text-sm">{format(new Date(ex.date), "PPP")}</span>
                                    {ex.isAvailable ? (
                                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                                            {ex.startTime} - {ex.endTime}
                                        </Badge>
                                    ) : (
                                        <Badge variant="destructive">{t('unavailable')}</Badge>
                                    )}
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(ex.id)} disabled={isPending}>
                                    <Trash2 className="h-4 w-4 hover:text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
