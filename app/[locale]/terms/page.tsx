import { LandingNavbar } from "@/components/landing/landing-navbar";
import { Footer } from "@/components/landing/footer";
import { TermsContent } from "@/components/legal/terms-content";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Auth' });
    return {
        title: `${t('termsLink')} | Scheduler`,
    };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Auth' });

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 font-sans flex flex-col">
            <LandingNavbar />

            <main className="flex-1 py-12 md:py-20 container mx-auto px-4 md:px-6 max-w-4xl">
                <div className="mb-8 md:mb-12 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 inline-block">
                        {t('termsLink')}
                    </h1>
                </div>

                <div className="bg-card border border-border/50 rounded-xl p-6 md:p-10 shadow-sm">
                    <TermsContent />
                </div>
            </main>

            <Footer />
        </div>
    );
}
