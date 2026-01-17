"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ServiceSchema } from "@/schemas";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createService, updateService } from "@/actions/services";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { toast } from "sonner";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useCurrentUser } from "@/hooks/use-current-user";

interface ServiceProps {
    id: string;
    title: string;
    description: string | null;
    duration: number;
    price: number;
    location: string | null;
    url: string;
    color: string;
    capacity: number;
    bufferTime: number;
    minNotice: number;
    isActive: boolean;
}

interface ServiceFormProps {
    service?: ServiceProps;
    onSuccess?: () => void;
    onServiceSaved?: (service: any) => void;
}

export const ServiceForm = ({ service, onSuccess, onServiceSaved }: ServiceFormProps) => {
    const user = useCurrentUser();
    const router = useRouter();
    const [error, setError] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const onSubmit = (values: z.infer<typeof ServiceSchema>) => {
        setError("");

        startTransition(() => {
            if (service) {
                updateService(service.id, values)
                    .then((data) => {
                        if (data.error) {
                            setError(data.error);
                            toast.error(data.error);
                        }
                        if (data.success) {
                            toast.success(data.success);
                            router.refresh();
                            if (onServiceSaved && data.service) {
                                onServiceSaved(data.service);
                            }
                            if (onSuccess) {
                                onSuccess();
                            }
                        }
                    });
            } else {
                createService(values)
                    .then((data) => {
                        if (data.error) {
                            setError(data.error);
                            toast.error(data.error);
                        }
                        if (data.success) {
                            toast.success(data.success);
                            router.refresh();
                            if (onServiceSaved && data.service) {
                                onServiceSaved(data.service);
                            }
                            if (onSuccess) {
                                onSuccess();
                            } else {
                                router.push("/dashboard/services");
                            }
                        }
                    });
            }
        });
    };

    type FormValues = z.infer<typeof ServiceSchema>;

    const form = useForm<FormValues>({
        resolver: zodResolver(ServiceSchema) as any,
        defaultValues: {
            title: service?.title || "",
            description: service?.description || "",
            duration: service?.duration || 30,
            price: service?.price || 0,
            location: service?.location || "",
            url: service?.url || "",
            isActive: service?.isActive ?? true,
            color: service?.color || "#6366f1",
            capacity: service?.capacity || 1,
            bufferTime: service?.bufferTime || 0,
            minNotice: service?.minNotice || 60,
        },
    });



    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled={isPending} placeholder="e.g. 30 Min Meeting" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>URL Slug</FormLabel>
                                <FormControl>
                                    <div className="flex items-center">
                                        <span className="bg-muted border border-r-0 rounded-l-md px-3 py-2 text-sm text-muted-foreground">/</span>
                                        <Input {...field} className="rounded-l-none" disabled={isPending} placeholder="30-min-meeting" />
                                    </div>
                                </FormControl>
                                <FormDescription>Public link: domain.com/[username]/{field.value}</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="duration"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Duration (min)</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            disabled={isPending}
                                            onChange={e => field.onChange(e.target.value === "" ? 0 : parseInt(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price ($)</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            disabled={isPending}
                                            onChange={e => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="capacity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Capacity</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            min={1}
                                            disabled={isPending}
                                            onChange={e => field.onChange(e.target.value === "" ? 1 : parseInt(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bufferTime"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Buffer (min)</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            min={0}
                                            disabled={isPending}
                                            onChange={e => field.onChange(e.target.value === "" ? 0 : parseInt(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Color Theme</FormLabel>
                                    <FormControl>
                                        <div className="flex flex-wrap gap-2">
                                            {["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#3b82f6"].map((color) => (
                                                <div
                                                    key={color}
                                                    className={`w-8 h-8 rounded-full cursor-pointer transition-all border-2 ${field.value === color ? "border-white scale-110" : "border-transparent opacity-50 hover:opacity-100"}`}
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => field.onChange(color)}
                                                />
                                            ))}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea {...field} disabled={isPending} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select location type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Google Meet">Google Meet</SelectItem>
                                        <SelectItem value="Zoom">Zoom</SelectItem>
                                        <SelectItem value="Phone Call">Phone Call</SelectItem>
                                        <SelectItem value="In Person">In Person</SelectItem>
                                        <SelectItem value="Custom Link">Custom Link</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Active</FormLabel>
                                    <FormDescription>Turn off to hide from public profile</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isPending}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
                <FormError message={error} />

                <Button type="submit" disabled={isPending}>
                    {service ? "Update Service" : "Create Service"}
                </Button>
            </form>
        </Form>
    );
}
