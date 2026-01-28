import { getUserByUsername } from "@/data/user";
import { notFound } from "next/navigation";
import { BookingCalendar } from "@/components/booking/booking-calendar";
import { getTranslations } from "next-intl/server";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AutoRefresh } from "@/components/auto-refresh";

interface ServicePageProps {
    params: Promise<{ username: string; serviceUrl: string }>;
}

export const revalidate = 0;

const ServiceBookingPage = async ({ params }: ServicePageProps) => {
    const { username, serviceUrl } = await params;
    const user = await getUserByUsername(username);
    const tBooking = await getTranslations("Booking");

    if (!user) return notFound();

    const service = user.services.find((s: any) => s.url === serviceUrl);
    if (!service) return notFound();

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden dark">
            <AutoRefresh />
            {/* Decorative backgrounds */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px] animate-blob" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[100px] animate-blob animation-delay-2000" />

            <div className="relative border border-white/10 rounded-2xl shadow-2xl flex flex-col md:flex-row w-full max-w-5xl h-auto md:h-[700px] overflow-hidden bg-slate-900/60 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500 z-10">
                {/* Left Panel: Details */}
                <div className="w-full md:w-1/3 bg-slate-950/50 p-8 border-b md:border-b-0 md:border-r border-white/10 flex flex-col">
                    <Button variant="ghost" size="sm" className="self-start text-slate-400 hover:text-white mb-6 -ml-3" asChild>
                        <Link href={`/${user.username}`}>
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            {tBooking("backToProfile")}
                        </Link>
                    </Button>
                    <div className="flex items-center gap-3 mb-8">

                        <Avatar className="h-12 w-12 ring-2 ring-indigo-500/50 shadow-lg">
                            <AvatarImage src={user.image || ""} className="object-cover aspect-square" />
                            <AvatarFallback className="bg-indigo-500/10 text-indigo-400 font-bold">{user.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-slate-300 font-medium text-sm">{tBooking("bookingWith")}</p>
                            <p className="text-white font-semibold text-lg leading-none">{user.name}</p>
                        </div>
                    </div>

                    <h1 className="text-3xl font-extrabold text-white mb-4 leading-tight">{service.title}</h1>

                    <div className="flex flex-wrap items-center gap-3 text-sm font-medium mb-8">
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-md border border-white/10 text-slate-300">
                            <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)] animate-pulse"></span>
                            {service.duration} min
                        </div>
                        <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-md border border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]">
                            {service.price > 0 ? `$${service.price}` : tBooking("free")}
                        </span>
                    </div>

                    {service.description && (
                        <div className="pt-6 border-t border-white/10 flex-1 overflow-y-auto custom-scrollbar">
                            <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3">{tBooking("aboutService")}</h3>
                            <p className="text-slate-400 text-sm whitespace-pre-wrap leading-relaxed">
                                {service.description}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Panel: Calendar & Slots */}
                <div className="w-full md:w-2/3 p-6 md:p-8 overflow-y-auto bg-transparent [&::-webkit-scrollbar]:hidden text-slate-100">
                    <BookingCalendar service={service} user={user} />
                </div>
            </div>
        </div>
    );
}

export default ServiceBookingPage;
