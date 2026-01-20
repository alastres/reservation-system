"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, CheckCircle, Smartphone, LogOut, Menu, LayoutDashboard } from "lucide-react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/auth/logout-button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/20">

      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/5 bg-background/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Scheduler
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#about" className="hover:text-primary transition-colors">About</a>
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
                      <p className="text-xs text-muted-foreground mt-1">{session.user.email}</p>
                    </div>
                  </div>
                  {(session.user as any).role !== "CLIENT" && (
                    <Button variant="outline" size="sm" asChild className="hidden sm:flex border-white/10">
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                  )}
                  <LogoutButton variant="ghost" size="sm" className="text-muted-foreground hover:text-red-400">
                    <LogOut className="h-4 w-4" />
                  </LogoutButton>
                </div>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/auth/login">Log in</Link>
                  </Button>
                  <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25" asChild>
                    <Link href="/auth/register">Get Started</Link>
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
                      <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Scheduler
                      </span>
                    </Link>

                    <div className="flex flex-col gap-4 text-lg font-medium">
                      <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
                      <Link href="#about" className="hover:text-primary transition-colors">About</Link>
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
                        {(session.user as any).role !== "CLIENT" && (
                          <Button className="w-full justify-start" variant="outline" asChild>
                            <Link href="/dashboard">
                              <LayoutDashboard className="mr-2 h-4 w-4" />
                              Dashboard
                            </Link>
                          </Button>
                        )}
                        <div className="mt-2">
                          <LogoutButton variant="secondary" className="w-full justify-start text-red-400 hover:text-red-500 hover:bg-red-950/20">
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                          </LogoutButton>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <Button variant="ghost" asChild className="w-full justify-start text-lg">
                          <Link href="/auth/login">Log in</Link>
                        </Button>
                        <Button className="w-full text-white shadow-lg shadow-primary/25" asChild>
                          <Link href="/auth/register">Get Started</Link>
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[500px] bg-primary/20 blur-[120px] rounded-full opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto relative z-10 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary mb-6">
              v2.0 is now live
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
              Scheduling simplified for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                Professionals
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Eliminate back-and-forth emails. Set your availability, share your link, and let clients book instantly.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link href="/dashboard">
                  Start for free <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base border-white/10">
                View Demo
              </Button>
            </div>
          </motion.div>

          {/* Mockup / Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative mx-auto max-w-5xl"
          >
            <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl p-2 md:p-4">
              <div className="rounded-lg overflow-hidden bg-background aspect-[16/9] relative border border-white/5">
                {/* Abstract UI representation */}
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
                  <div className="grid grid-cols-4 gap-4 w-3/4 h-3/4 opacity-30">
                    <div className="col-span-1 bg-primary/20 rounded-md" />
                    <div className="col-span-3 bg-white/5 rounded-md" />
                    <div className="col-span-4 h-full bg-white/5 rounded-md" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-black/20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Calendar className="w-6 h-6 text-blue-400" />,
                title: "Calendar Sync",
                desc: "Real-time synchronization with Google Calendar to prevent double bookings."
              },
              {
                icon: <Smartphone className="w-6 h-6 text-purple-400" />,
                title: "Mobile Ready",
                desc: "Fully responsive booking pages that look great on any device."
              },
              {
                icon: <CheckCircle className="w-6 h-6 text-green-400" />,
                title: "Automated Reminders",
                desc: "Reduce no-shows with automated email confirmations (via Nodemailer)."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors group"
              >
                <div className="mb-4 p-3 rounded-xl bg-white/5 w-fit group-hover:bg-primary/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
