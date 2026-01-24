"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";

interface ProfileContentProps {
    user: any;
}

export function ProfileContent({ user }: ProfileContentProps) {
    const t = useTranslations("Profile");
    const [dominantColor, setDominantColor] = useState<string>("rgb(49, 46, 129)"); // indigo-950 default
    const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        if ((user as any).coverImage) {
            extractDominantColor((user as any).coverImage);
        }
    }, [(user as any).coverImage]);

    // Intersection Observer for scroll animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                setVisibleCards((prev) => {
                    const newSet = new Set(prev);
                    entries.forEach((entry) => {
                        const index = parseInt(entry.target.getAttribute('data-index') || '0');
                        if (entry.isIntersecting) {
                            newSet.add(index);
                        } else {
                            // Only remove (fade out) if it exits via the bottom
                            // This keeps items visible when they scroll off the top
                            if (entry.boundingClientRect.top > 0) {
                                newSet.delete(index);
                            }
                        }
                    });
                    return newSet;
                });
            },
            {
                threshold: 0.1,
                rootMargin: '-50px 0px -50px 0px' // Adjusted margins for better exit/enter timing
            }
        );

        cardRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, [user.services.length]);

    const extractDominantColor = (imageUrl: string) => {
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    console.log("Could not get canvas context");
                    return;
                }

                // Use smaller canvas for better performance
                canvas.width = 100;
                canvas.height = 100;
                ctx.drawImage(img, 0, 0, 100, 100);

                // Sample pixels from the top portion of the image
                const imageData = ctx.getImageData(0, 0, 100, 30);
                const data = imageData.data;

                let r = 0, g = 0, b = 0;
                const pixelCount = data.length / 4;

                for (let i = 0; i < data.length; i += 4) {
                    r += data[i];
                    g += data[i + 1];
                    b += data[i + 2];
                }

                r = Math.floor(r / pixelCount);
                g = Math.floor(g / pixelCount);
                b = Math.floor(b / pixelCount);

                // Brighten the color significantly for visibility
                // Multiply by 2.0 and cap at 255 for a much more visible effect
                r = Math.min(255, Math.floor(r * 2.0));
                g = Math.min(255, Math.floor(g * 2.0));
                b = Math.min(255, Math.floor(b * 2.0));

                const extractedColor = `rgb(${r}, ${g}, ${b})`;
                console.log("Extracted dominant color:", extractedColor);
                setDominantColor(extractedColor);
            } catch (error) {
                console.error("Error extracting color:", error);
            }
        };

        img.onerror = (error) => {
            console.error("Could not load image for color extraction:", error);
        };

        // Try to load the image
        img.src = imageUrl;
    };

    return (
        <>
            {/* Cover Image - Facebook style: constrained width on desktop, rounded bottom corners */}
            <div className="w-full flex justify-center relative isolate">
                {/* Gradient background with dominant color */}
                <div
                    className="absolute top-0 left-0 right-0 h-[350px] -z-10"
                    style={{
                        background: `linear-gradient(to bottom, ${dominantColor.replace('rgb', 'rgba').replace(')', ', 0.6)')} 0%, ${dominantColor.replace('rgb', 'rgba').replace(')', ', 0.3)')} 50%, transparent 100%)`
                    }}
                ></div>

                <div className="relative w-full max-w-5xl h-[350px] bg-slate-900/50 overflow-hidden rounded-b-xl">
                    {(user as any).coverImage ? (
                        <img
                            src={(user as any).coverImage}
                            alt="Cover"
                            className="w-full h-full object-cover animate-in fade-in duration-700"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-blue-900/40 backdrop-blur-sm flex items-center justify-center">
                            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
                        </div>
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/60 pointer-events-none" />
                </div>
            </div>

            {/* Profile Section - Facebook style: overlapping avatar */}
            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative -mt-16 sm:-mt-20 mb-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                        {/* Avatar with white ring like Facebook - positioned to the left */}
                        <Avatar className="h-36 w-36 sm:h-40 sm:w-40 ring-8 ring-slate-950 shadow-2xl shadow-black/50 bg-slate-800 sm:ml-0">
                            <AvatarImage src={user.image || ""} className="object-cover" />
                            <AvatarFallback className="text-5xl font-bold bg-slate-800 text-indigo-400">{user.name?.[0]}</AvatarFallback>
                        </Avatar>

                        {/* Name and username section - positioned lower */}
                        <div className="flex-1 text-center sm:text-left sm:mt-auto sm:pb-2">
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-1 drop-shadow-lg">
                                {user.name}
                            </h1>
                            <p className="text-indigo-400 font-medium text-base">
                                @{user.username}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bio */}
                {user.bio && (
                    <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h2 className="text-xs font-semibold tracking-widest uppercase text-slate-500 mb-3">
                            {t("aboutMe")}
                        </h2>
                        <p className="max-w-2xl text-slate-300 leading-relaxed bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl">
                            {user.bio}
                        </p>
                    </div>
                )}
            </div>

            {/* Floating WhatsApp Button */}
            {(user as any).phone && (
                <a
                    href={`https://wa.me/${(user as any).phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-full shadow-2xl shadow-green-900/50 transition-all duration-300 hover:scale-110 group"
                    aria-label="Chat on WhatsApp"
                >
                    <svg className="w-8 h-8 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></span>
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full"></span>
                </a>
            )}

            {/* Services Section */}
            <div className="relative max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <div className="mb-8 text-center">
                    <h2 className="text-xs font-semibold tracking-widest uppercase text-slate-500 mb-2">
                        {t("services")}
                    </h2>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
                    {user.services.length === 0 ? (
                        <div className="col-span-full text-center p-10 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg">
                            <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <span className="text-3xl">📭</span>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-200 mb-2">{t("noServices")}</h3>
                            <p className="text-slate-400">{t("noServicesDesc")}</p>
                        </div>
                    ) : (
                        user.services.map((service: any, index: number) => (
                            <div
                                key={service.id}
                                ref={(el) => { cardRefs.current[index] = el; }}
                                data-index={index}
                                className={`transition-all duration-700 ${visibleCards.has(index)
                                    ? 'opacity-100 translate-y-0'
                                    : 'opacity-0 translate-y-8'
                                    }`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                <Card className="group relative hover:scale-[1.02] transition-all duration-300 border-white/10 bg-slate-900/60 backdrop-blur-md overflow-hidden hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-900/30 h-full">
                                    {/* Gradient top bar */}
                                    <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" />

                                    {/* Hover glow effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500 pointer-events-none" />

                                    <CardHeader className="relative pb-3">
                                        {/* Service icon */}
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>

                                        <CardTitle className="text-2xl font-bold text-slate-100 group-hover:text-indigo-300 transition-colors mb-2">
                                            {service.title}
                                        </CardTitle>

                                        <CardDescription className="flex items-center gap-3 text-slate-400 font-medium">
                                            <span className="flex items-center gap-1.5">
                                                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-sm">{service.duration} min</span>
                                            </span>
                                            <span className="inline-block w-1 h-1 rounded-full bg-slate-600" />
                                            <span className="flex items-center gap-1.5">
                                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
                                                <span className="text-sm">{t("available")}</span>
                                            </span>
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="relative pb-4">
                                        <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                                            {service.description || "No description provided."}
                                        </p>
                                    </CardContent>

                                    <CardFooter className="relative pt-4">
                                        <Button className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-indigo-900/50 border border-white/10 group-hover:shadow-indigo-500/50 transition-all duration-300" asChild>
                                            <Link href={`/${user.username}/${service.url}`} className="flex items-center justify-center gap-2">
                                                <span>{t("bookNow")}</span>
                                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
