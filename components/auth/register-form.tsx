"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema } from "@/schemas";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TermsModal, PrivacyModal } from "@/components/legal/legal-modals";
import { Link } from "@/i18n/routing";
import { useState, useTransition, useEffect } from "react";
import { register } from "@/actions/register";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { useTranslations } from "next-intl";

export const RegisterForm = () => {
    const t = useTranslations('Auth');
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");

    const form = useForm({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            email: "",
            password: "",
            name: "",
            termsAccepted: false,
            timeZone: "UTC", // Default fallback
            website: "",
        },
    });

    // Auto-detect timezone
    useEffect(() => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz) {
            form.setValue("timeZone", tz);
        }
    }, [form]);

    const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
        setError("");
        setSuccess("");
        // Ensure timezone is set if not already
        if (!values.timeZone) {
            values.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        }

        startTransition(() => {
            register(values).then((data) => {
                if (data.error) {
                    setError(data.error);
                }
                if (data.success) {
                    // Redirect to verification page
                    setSuccess(data.success);
                    // Small delay to show success message or just redirect immediately
                    // routing.defaultLocale or just standard window.location or next/navigation
                    // We are in client component, can use router.push but need to handle locale.
                    // Assuming current locale is in path.
                    // Quickest way: 
                    window.location.href = `/auth/verify-email?email=${encodeURIComponent(values.email)}`;
                }
            });
        });
    };

    return (
        <CardWrapper
            headerLabel={t('createAccount')}
            backButtonLabel={t('alreadyHaveAccount')}
            backButtonHref="/auth/login"
            showSocial
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('name')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder="John Doe"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('email')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder="john.doe@example.com"
                                            type="email"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('password')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder="******"
                                            type="password"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="termsAccepted"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="mt-0.5"
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel className="font-normal text-muted-foreground block text-sm">
                                        {t('acceptTerms')}{" "}
                                        <TermsModal>
                                            <span className="text-primary hover:underline cursor-pointer">
                                                {t('termsLink')}
                                            </span>
                                        </TermsModal>
                                        {" "}{t('and')}{" "}
                                        <PrivacyModal>
                                            <span className="text-primary hover:underline cursor-pointer">
                                                {t('privacyLink')}
                                            </span>
                                        </PrivacyModal>
                                    </FormLabel>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />
                    {/* Honeypot Field - Hidden from humans */}
                    <div className="absolute opacity-0 -z-50 select-none pointer-events-none" aria-hidden="true">
                        <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Website</FormLabel>
                                    <FormControl>
                                        <Input {...field} tabIndex={-1} autoComplete="off" />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormError message={error} />
                    <FormSuccess message={success} />
                    <Button
                        disabled={isPending}
                        type="submit"
                        className="w-full"
                    >
                        {t('register')}
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    );
};

