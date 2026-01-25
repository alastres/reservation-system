"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTranslations } from "next-intl";
import { Menu, LogOut, LayoutDashboard } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/auth/logout-button";

export const LandingNavbar = () => {
    const { data: session } = useSession();
    const t = useTranslations('Landing');
    const common = useTranslations('Common');

    return (
        <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/5 bg-background/50 backdrop-blur-xl">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">
                        S
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
                        Scheduler
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                    <a href="#features" className="hover:text-primary transition-colors">{t('hero.ctaSecondary') === "Ver demo" ? "Características" : "Features"}</a>
                    <a href="#pricing" className="hover:text-primary transition-colors">{t('hero.ctaSecondary') === "Ver demo" ? "Precios" : "Pricing"}</a>
                    <a href="#about" className="hover:text-primary transition-colors">{t('hero.ctaSecondary') === "Ver demo" ? "Sobre Nosotros" : "About Us"}</a>
                    <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
                </div>

                <div className="flex items-center gap-4">
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-4">
                        {session?.user ? (
                            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                                        <AvatarImage src={session.user.image || ""} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            {session.user.name?.[0]?.toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden lg:block">
                                        <p className="text-sm font-medium text-foreground leading-none">{session.user.name}</p>
                                    </div>
                                </div>
                                <Button variant="default" size="sm" asChild>
                                    <Link href="/dashboard">{common('dashboard')}</Link>
                                </Button>
                                <ThemeToggle />
                            </div>
                        ) : (
                            <>
                                <ThemeToggle />
                                <Button variant="ghost" asChild>
                                    <Link href="/auth/login">{t('hero.signIn') || "Sign In"}</Link>
                                </Button>
                                <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25" asChild>
                                    <Link href="/auth/register">{t('hero.getStarted') || "Get Started"}</Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] border-l border-white/10 bg-background/95 backdrop-blur-xl">
                                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                                <div className="flex flex-col gap-6 mt-6">
                                    <Link href="/" className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">
                                            S
                                        </div>
                                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
                                            Scheduler
                                        </span>
                                    </Link>

                                    <div className="flex flex-col gap-4 text-lg font-medium">
                                        <a href="#features" className="hover:text-primary transition-colors">Features</a>
                                        <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
                                        <a href="#about" className="hover:text-primary transition-colors">About Us</a>
                                        <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
                                    </div>

                                    <div className="h-px bg-white/10 my-2" />

                                    {session?.user ? (
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                                                    <AvatarImage src={session.user.image || ""} />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                        {session.user.name?.[0]?.toUpperCase() || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-foreground">{session.user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{session.user.email}</p>
                                                </div>
                                            </div>
                                            <Button className="w-full justify-start" variant="outline" asChild>
                                                <Link href="/dashboard">
                                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                                    {common('dashboard')}
                                                </Link>
                                            </Button>
                                            <div className="mt-2">
                                                <LogoutButton variant="secondary" className="w-full justify-start text-red-400 hover:text-red-500 hover:bg-red-950/20">
                                                    <LogOut className="mr-2 h-4 w-4" />
                                                    {common('logout')}
                                                </LogoutButton>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            <Button variant="ghost" asChild className="w-full justify-start text-lg">
                                                <Link href="/auth/login">{t('hero.signIn') || "Sign In"}</Link>
                                            </Button>
                                            <Button className="w-full text-white shadow-lg shadow-primary/25" asChild>
                                                <Link href="/auth/register">{t('hero.getStarted') || "Get Started"}</Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    );
};
