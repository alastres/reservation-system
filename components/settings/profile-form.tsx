"use client";

import { useRouter } from "next/navigation";
import { useTransition, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "@/actions/user";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { User } from "@prisma/client";
import { useState } from "react";

import { TimezoneSelect } from "@/components/ui/timezone-select";

import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface ProfileFormProps {
    user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isUploading, setIsUploading] = useState(false);
    const t = useTranslations("Settings.profile.form");

    const [formData, setFormData] = useState({
        name: user.name || "",
        username: user.username || "",
        bio: user.bio || "",
        timeZone: user.timeZone || "UTC",
        language: (user as any).language || "es",
        image: user.image || "",
        coverImage: (user as any).coverImage || "",
        address: (user as any).address || "",
        phone: (user as any).phone || "",
        notificationPreferences: {
            email: (user.notificationPreferences as any)?.email ?? true,
        },
        maxConcurrentClients: (user as any).maxConcurrentClients || 1,
    });

    // Sync state with props when user data updates (e.g. after save)
    useEffect(() => {
        setFormData({
            name: user.name || "",
            username: user.username || "",
            bio: user.bio || "",
            timeZone: user.timeZone || "UTC",
            language: (user as any).language || "es",
            image: user.image || "",
            coverImage: (user as any).coverImage || "",
            address: (user as any).address || "",
            phone: (user as any).phone || "",
            notificationPreferences: {
                email: (user.notificationPreferences as any)?.email ?? true,
            },
            maxConcurrentClients: (user as any).maxConcurrentClients || 1,
        });
    }, [user]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "image" | "coverImage") => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const data = new FormData();
        data.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: data,
            });
            const json = await res.json();
            if (json.url) {
                setFormData(prev => ({ ...prev, [field]: json.url }));
                toast.success(`${field === "image" ? "Profile picture" : "Cover image"} uploaded successfully!`);
            } else {
                toast.error("Failed to upload image.");
            }
        } catch (error) {
            toast.error("Something went wrong with upload.");
        } finally {
            setIsUploading(false);
        }
    };

    const { update } = useSession();

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(() => {
            console.log("Submitting form data:", formData);
            updateProfile({
                ...formData,
                coverImage: formData.coverImage,
                notificationPreferences: formData.notificationPreferences,
                maxConcurrentClients: Number(formData.maxConcurrentClients)
            })
                .then(async (data) => {
                    if (data.error) {
                        toast.error(data.error);
                    } else if (data.success) {
                        await update(); // Force update session on client
                        toast.success(data.success);
                        router.refresh();
                    }
                })
                .catch(() => toast.error("Something went wrong!"));
        });
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6 max-w-2xl bg-card p-6 rounded-xl border shadow-sm">
            {/* Cover Image Section */}
            <div className="space-y-4">
                <Label>{t('coverImage')}</Label>
                <div className="relative group w-full h-48 bg-muted rounded-xl overflow-hidden border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                    {formData.coverImage ? (
                        <img
                            src={formData.coverImage}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="text-center text-muted-foreground p-4">
                            <p className="text-sm font-medium">{t('noCover')}</p>
                            <p className="text-xs">{t('recCover')}</p>
                        </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Label
                            htmlFor="cover-upload"
                            className="cursor-pointer bg-white/90 text-black px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:bg-white transition-colors"
                        >
                            {t('changeCover')}
                        </Label>
                        <Input
                            id="cover-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleUpload(e, "coverImage")}
                            disabled={isUploading || isPending}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <Label>{t('profilePicture')}</Label>
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        {formData.image ? (
                            <img
                                src={formData.image}
                                alt="Profile"
                                className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-md group-hover:opacity-90 transition-opacity"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-md">
                                <span className="text-2xl font-bold text-muted-foreground">
                                    {formData.name?.charAt(0) || "U"}
                                </span>
                            </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Label
                                htmlFor="image-upload"
                                className="cursor-pointer bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
                            >
                                {t('change')}
                            </Label>
                        </div>
                    </div>

                    <div className="flex-1 space-y-2">
                        <Input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleUpload(e, "image")}
                            disabled={isUploading || isPending}
                        />
                        <div className="text-sm text-muted-foreground">
                            <p>{t('recProfile')}</p>
                            <p>{t('allowedFormats')}</p>
                        </div>
                        {isUploading && <p className="text-xs text-primary animate-pulse">{t('uploading')}</p>}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name">{t('fullName')}</Label>
                    <Input
                        id="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={isPending}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="username">{t('username')}</Label>
                    <Input
                        id="username"
                        placeholder="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        disabled={isPending}
                    />
                    <p className="text-xs text-muted-foreground">
                        scheduler.com/{formData.username || "username"}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="bio">{t('bio')}</Label>
                    <Textarea
                        id="bio"
                        placeholder={t('bio') + "..."}
                        className="resize-none min-h-[100px]"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        disabled={isPending}
                    />
                </div>
            </div>

            <div className="space-y-2 p-4 border rounded-lg bg-muted/20">
                <div className="flex items-center justify-between">
                    <Label htmlFor="maxConcurrentClients" className="font-semibold text-base">{t('capacity')}</Label>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{t('advanced')}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                    {(!user.role || user.role !== "ADMIN") && (!user.subscriptionPlan || user.subscriptionPlan === "FREE" as any)
                        ? <span className="text-yellow-600 dark:text-yellow-500 font-medium">{t('upgradeToProCapacity')}</span>
                        : t('capacityDesc')
                    }
                </p>
                <Input
                    id="maxConcurrentClients"
                    type="number"
                    min="1"
                    className="max-w-[100px]"
                    value={formData.maxConcurrentClients}
                    onChange={(e) => setFormData({ ...formData, maxConcurrentClients: Number(e.target.value) })}
                    disabled={isPending || ((!user.role || user.role !== "ADMIN") && (!user.subscriptionPlan || user.subscriptionPlan === "FREE" as any))}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="phone">{t('whatsapp')}</Label>
                    <PhoneInput
                        placeholder={t('whatsapp')}
                        value={formData.phone}
                        onChange={(val: string | undefined) => setFormData({ ...formData, phone: val || "" })}
                        disabled={isPending}
                        defaultCountry="ES"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">{t('address')}</Label>
                    <Input
                        id="address"
                        placeholder="123 Main St, City"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        disabled={isPending}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>{t('timeZone')}</Label>
                    <TimezoneSelect
                        value={formData.timeZone}
                        onChange={(val) => setFormData({ ...formData, timeZone: val })}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="language">{t('language')}</Label>
                    <Select
                        value={formData.language}
                        onValueChange={(value) => setFormData({ ...formData, language: value })}
                        disabled={isPending}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={t('selectLanguage')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="pt">Português</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>


            <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/30">
                <div className="space-y-0.5">
                    <Label className="text-base font-medium">{t('emailNotif')}</Label>
                    <p className="text-sm text-muted-foreground">
                        {t('emailNotifDesc')}
                    </p>
                </div>
                <Switch
                    checked={formData.notificationPreferences.email}
                    onCheckedChange={(checked) =>
                        setFormData({
                            ...formData,
                            notificationPreferences: { ...formData.notificationPreferences, email: checked }
                        })
                    }
                    disabled={isPending}
                />
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isPending || isUploading} className="min-w-[120px]">
                    {isPending ? t('saving') : t('save')}
                </Button>
            </div>
        </form>
    );
}
