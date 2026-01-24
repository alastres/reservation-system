"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

import { newVerification } from "@/actions/new-verification";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Schema specifically for 6-digit OTP
const OtpSchema = z.object({
    token: z.string().length(6, { message: "code_length_error" }),
});

export const VerifyEmailForm = () => {
    const t = useTranslations("Auth");
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();
    const [isPending, startTransition] = useTransition();

    const searchParams = useSearchParams();
    // Support ?token=123456 from email link (if we keep link support) or manual entry
    const urlToken = searchParams.get("token");
    const email = searchParams.get("email");

    const form = useForm<z.infer<typeof OtpSchema>>({
        resolver: zodResolver(OtpSchema),
        defaultValues: {
            token: urlToken || "",
        },
    });

    const onSubmit = useCallback((values: z.infer<typeof OtpSchema>) => {
        if (!email) {
            setError(t('email_missing'));
            return;
        }
        setError(undefined);
        setSuccess(undefined);

        startTransition(() => {
            newVerification(values.token, email)
                .then((data) => {
                    if (data.success) {
                        setSuccess(data.success);
                        // Redirect to dashboard (or login if session needed)
                        setTimeout(() => {
                            window.location.href = "/dashboard";
                        }, 1000);
                    } else {
                        setError(data.error);
                    }
                })
                .catch(() => {
                    setError(t('error_verification_failed'));
                });
        });
    }, [t, email]);

    // Auto-submit if token is present in URL (optional, good for UX if we still send a link with code)
    useEffect(() => {
        if (urlToken) {
            onSubmit({ token: urlToken });
        }
    }, [urlToken, onSubmit]);

    return (
        <CardWrapper
            headerLabel={t('verify_email_header')}
            backButtonLabel={t('back_to_login')}
            backButtonHref="/auth/login"
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="token"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('verification_code')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder="123456"
                                            className="text-center text-2xl tracking-widest letter-spacing-8"
                                            maxLength={6}
                                        />
                                    </FormControl>
                                    <FormMessage />
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
                        {t('verify_button')}
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    );
};
