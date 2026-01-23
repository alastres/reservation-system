import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "@/app/globals.css";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing'; // We need this, or just hardcode locales for now

const fontSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-sans",
});

export const metadata: Metadata = {
    title: "Scheduler | Premium Booking System",
    description: "Seamless scheduling for professionals.",
};

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: { locale: string };
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
