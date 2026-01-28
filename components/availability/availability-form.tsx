"use client";

import { useState, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { saveAvailability } from "@/actions/availability";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormControl, FormLabel } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

// Local schema for the form
const FormSchema = z.object({
    schedule: z.array(z.object({
        dayOfWeek: z.number(),
        isEnabled: z.boolean(),
        startTime: z.string(),
        endTime: z.string()
    }))
});

// Helper for default schedule (Mon-Fri 9-5)
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface AvailabilityFormProps {
    initialData: { dayOfWeek: number; startTime: string; endTime: string }[];
}

export const AvailabilityForm = ({ initialData }: AvailabilityFormProps) => {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const t = useTranslations("Availability.form");

    // Merge initialData with defaults
    const defaultSchedule = DAYS.map((_, index) => {
        const existing = initialData.find(rule => rule.dayOfWeek === index);
        return {
            dayOfWeek: index,
            isEnabled: !!existing,
            startTime: existing?.startTime || "09:00",
            endTime: existing?.endTime || "17:00"
        };
    });

    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: { schedule: defaultSchedule }
    });

    const onSubmit = (values: z.infer<typeof FormSchema>) => {
        setError("");
        setSuccess("");

        const rulesToSave = values.schedule
            .filter(day => day.isEnabled)
            .map(day => ({
                dayOfWeek: day.dayOfWeek,
                startTime: day.startTime,
                endTime: day.endTime
            }));

        startTransition(() => {
            saveAvailability(rulesToSave).then((data) => {
                if (data.error) setError(data.error);
                if (data.success) setSuccess(data.success);
            });
        });
    };

    const { fields } = useFieldArray({
        control: form.control,
        name: "schedule"
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex flex-col sm:flex-row sm:items-center justify-between border p-3 rounded-lg gap-y-3 sm:gap-y-0">
                                <div className="flex items-center gap-x-4">
                                    <FormField
                                        control={form.control}
                                        name={`schedule.${index}.isEnabled`}
                                        render={({ field }) => (
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isPending} />
                                            </FormControl>
                                        )}
                                    />
                                    <span className="w-24 font-medium">{t(`days.${DAYS[index].toLowerCase()}`)}</span>
                                </div>
                                {form.watch(`schedule.${index}.isEnabled`) ? (
                                    <div className="flex items-center gap-x-2">
                                        <FormField
                                            control={form.control}
                                            name={`schedule.${index}.startTime`}
                                            render={({ field }) => (
                                                <FormControl>
                                                    <Input {...field} type="time" className="w-32" disabled={isPending} />
                                                </FormControl>
                                            )}
                                        />
                                        <span>-</span>
                                        <FormField
                                            control={form.control}
                                            name={`schedule.${index}.endTime`}
                                            render={({ field }) => (
                                                <FormControl>
                                                    <Input {...field} type="time" className="w-32" disabled={isPending} />
                                                </FormControl>
                                            )}
                                        />
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground text-sm italic">{t('unavailable')}</span>
                                )}
                            </div>
                        ))}
                        <FormError message={error} />
                        <FormSuccess message={success} />
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isPending ? t('saving') : t('save')}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};
