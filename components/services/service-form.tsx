"use client";

import * as z from "zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Trash2 } from "lucide-react"; // Import Trash2
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
    customInputs?: any[];
    isRecurrenceEnabled: boolean;
    maxRecurrenceCount: number;
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
        // ... (onSubmit logic unchanged)
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
            locationType: (service as any)?.locationType || "GOOGLE_MEET",
            address: (service as any)?.address || (user as any)?.address || "",
            locationUrl: (service as any)?.locationUrl || "",
            url: service?.url || "",
            isActive: service?.isActive ?? true,
            color: service?.color || "#6366f1",
            capacity: service?.capacity || 1,
            bufferTime: service?.bufferTime || 0,
            minNotice: service?.minNotice || 60,
            customInputs: (service?.customInputs as any[]) || [],
            isRecurrenceEnabled: service?.isRecurrenceEnabled ?? false,
            maxRecurrenceCount: service?.maxRecurrenceCount || 4,
            requiresPayment: (service as any)?.requiresPayment ?? false,
        },
    });

    const fieldsReturn = useFieldArray({
        control: form.control,
        name: "customInputs",
    });

    // Auto-fill address from profile if empty when switching to IN_PERSON
    const locationType = form.watch("locationType");
    const currentAddress = form.watch("address");

    // We need useEffect to react to locationType changes
    // But be careful not to overwrite if user typed something
    // Only set if address is empty and we have a user address

    // Actually, react-hook-form defaultValues logic is better for initial load.
    // For runtime switching, we can use an effect.

    // Note: user object might need casting if types aren't updated yet globally
    const userAddress = (user as any)?.address;

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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
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
                                        <FormDescription>Max people per slot (1 = individual, &gt;1 = group)</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="space-y-4">
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
                        name="locationType"
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
                                        <SelectItem value="GOOGLE_MEET">Google Meet</SelectItem>
                                        <SelectItem value="PHONE">Phone Call</SelectItem>
                                        <SelectItem value="IN_PERSON">In Person</SelectItem>
                                        <SelectItem value="CUSTOM">Custom Link</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    {field.value === "GOOGLE_MEET" && "A Meet link will be generated automatically."}
                                    {field.value === "PHONE" && "Client will be required to provide their phone number."}
                                    {field.value === "IN_PERSON" && "You must provide an address below."}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {form.watch("locationType") === "IN_PERSON" && (
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={isPending} placeholder="123 Main St, City" />
                                    </FormControl>
                                    <FormDescription>
                                        Leave empty to use your Default Profile Address.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {form.watch("locationType") === "CUSTOM" && (
                        <FormField
                            control={form.control}
                            name="locationUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Meeting URL</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={isPending} placeholder="https://..." />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
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
                    <FormField
                        control={form.control}
                        name="requiresPayment"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Require Payment</FormLabel>
                                    <FormDescription>Clients must pay before booking is confirmed</FormDescription>
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

                {/* Recurrence Settings */}
                <div className="space-y-4 border border-input/50 rounded-lg p-4 bg-muted/20">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">Recursive Bookings</FormLabel>
                        <FormDescription>Allow customers to book recurring appointments (e.g., weekly).</FormDescription>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <FormField
                            control={form.control}
                            name="isRecurrenceEnabled"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-3 bg-card">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-sm font-medium">Enable Recurrence</FormLabel>
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
                        <FormField
                            control={form.control}
                            name="maxRecurrenceCount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Max Occurrences</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            min={1}
                                            disabled={isPending || !form.watch("isRecurrenceEnabled")}
                                            onChange={e => field.onChange(parseInt(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormDescription>Limit how many times it can repeat.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Custom Fields Section */}
                <div className="space-y-4 border border-input/50 rounded-lg p-4 bg-muted/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <FormLabel className="text-base">Custom Questions</FormLabel>
                            <FormDescription>Ask your clients additional questions when they book.</FormDescription>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const { append } = fieldsReturn;
                                append({ id: crypto.randomUUID(), label: "", type: "text", required: false, options: [] });
                            }}
                        >
                            + Add Question
                        </Button>
                    </div>

                    <div className="space-y-4 mt-4">
                        {fieldsReturn.fields.map((fieldItem, index) => (
                            <div key={fieldItem.id} className="grid grid-cols-12 gap-3 items-end border p-3 rounded-md bg-card shadow-sm">
                                <FormItem className="col-span-4">
                                    <FormLabel>Label</FormLabel>
                                    <FormControl>
                                        <Input {...form.register(`customInputs.${index}.label`)} placeholder="e.g. Phone Number" disabled={isPending} />
                                    </FormControl>
                                </FormItem>

                                <FormItem className="col-span-3">
                                    <FormLabel>Type</FormLabel>
                                    {/* Using Controller or Register for Select is tricky, simplified select */}
                                    <FormControl>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            {...form.register(`customInputs.${index}.type`)}
                                            disabled={isPending}
                                        >
                                            <option value="text">Short Text</option>
                                            <option value="textarea">Long Text</option>
                                            <option value="checkbox">Checkbox (Yes/No)</option>
                                            {/* <option value="select">Dropdown</option> */}
                                        </select>
                                    </FormControl>
                                </FormItem>

                                <FormItem className="col-span-3 flex flex-row items-center space-x-2 space-y-0 h-10">
                                    <FormControl>
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                            {...form.register(`customInputs.${index}.required`)}
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">Required</FormLabel>
                                </FormItem>

                                <div className="col-span-2 flex justify-end">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive"
                                        onClick={() => fieldsReturn.remove(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <FormMessage>{form.formState.errors.customInputs?.[index]?.label?.message}</FormMessage>
                            </div>
                        ))}
                    </div>
                </div>

                <FormError message={error} />

                <Button type="submit" disabled={isPending}>
                    {service ? "Update Service" : "Create Service"}
                </Button>
            </form>
        </Form>
    );
}
