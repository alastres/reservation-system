import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "@/app/globals.css";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
// Force rebuild for translations
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

const fontSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-sans",
});

export async function generateMetadata({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Metadata' });

    return {
        title: t('title'),
        description: t('description'),
    };
}

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    // Await params
    const { locale } = await params;

    // Ensure that the incoming `locale` is valid
    if (!['en', 'es'].includes(locale)) {
        notFound();
    }

    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning>
            <body className={cn(fontSans.variable, "font-sans bg-background text-foreground antialiased selection:bg-primary/20", "min-h-screen")}>
                <NextIntlClientProvider messages={messages}>
                    <Providers>
                        {children}
                        <Toaster />
                    </Providers>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
