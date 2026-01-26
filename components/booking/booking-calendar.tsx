"use client";

import { useState, useEffect, useTransition } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
<<<<<<< HEAD
import { es, enUS } from "date-fns/locale";
import { getSlotsAction, createBooking, confirmPaymentAndBooking } from "@/actions/booking";
=======
import { getSlotsAction, createBooking } from "@/actions/booking";
>>>>>>> master
import { Loader2, Check, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/form-error";
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useSession } from "next-auth/react";
import { ClientAuthDialog } from "@/components/auth/client-auth-dialog";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CheckoutForm } from "./checkout-form";
import { useTranslations, useLocale } from "next-intl";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const locales: Record<string, any> = { es, en: enUS };

interface BookingCalendarProps {
    service: any;
    user: any;
}

export const BookingCalendar = ({ service, user }: BookingCalendarProps) => {
    const t = useTranslations("Booking");
    const locale = useLocale();
    const dateLocale = locales[locale] || enUS;

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [slots, setSlots] = useState<{ time: string; spots: number }[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [bookingStage, setBookingStage] = useState<"SLOT" | "AUTH" | "FORM" | "PAYMENT" | "SUCCESS">("SLOT");
    const [paymentData, setPaymentData] = useState<{ clientSecret: string; paymentIntentId: string } | null>(null);

    const { data: session } = useSession();

    // Booking Form State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [clientPhone, setClientPhone] = useState<string | undefined>("");
    const [notes, setNotes] = useState("");
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [recurrence, setRecurrence] = useState("none");
    const [isBooking, startBooking] = useTransition();
    const [bookingError, setBookingError] = useState("");

    // Fetch slots when date changes
    useEffect(() => {
        if (!date) return;

        const fetchSlots = async () => {
            setLoadingSlots(true);
            setSlots([]);
            setSelectedSlot(null);
            setBookingStage("SLOT");

            try {
                const dateStr = format(date, "yyyy-MM-dd");
                const timeZone = user.timeZone || "UTC";
                const res = await getSlotsAction(dateStr, service.id, timeZone);
                if (res.slots) {
                    setSlots(res.slots);
                }
            } catch (e) {
                console.error("Error fetching slots", e);
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchSlots();
    }, [date, service.id, user.timeZone]);

    const handleSlotClick = (slotTime: string) => {
        setSelectedSlot(slotTime);
        if (!session) {
            setBookingStage("AUTH");
        } else {
            setBookingStage("FORM");
        }
    };

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleConfirmBooking = () => {
        if (!date || !selectedSlot) return;
        if (!name || !email) {
            setBookingError(t("errors.nameEmailRequired"));
            return;
        }

        if (!validateEmail(email)) {
            setBookingError(t("errors.invalidEmail"));
            return;
        }

        // Validate Phone if required
        if (service.locationType === "PHONE") {
            if (!clientPhone) {
                setBookingError(t("errors.phoneRequired"));
                return;
            }
            if (!isValidPhoneNumber(clientPhone)) {
                setBookingError(t("errors.invalidPhone"));
                return;
            }
        }

        // Validate required custom inputs
        if (service.customInputs) {
            for (const field of (service.customInputs as any[])) {
                if (field.required && !answers[field.label]) {
                    setBookingError(t("errors.fieldRequired", { field: field.label }));
                    return;
                }
            }
        }

        setBookingError("");
        const dateStr = format(date, "yyyy-MM-dd");
        const timeZone = user.timeZone || "UTC";
        const clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        startBooking(() => {
            createBooking(service.id, dateStr, selectedSlot, { name, email, clientPhone: clientPhone || undefined, notes, answers, recurrence }, timeZone, clientTimeZone)
                .then((data: any) => {
                    if (data.error) {
                        setBookingError(data.error);
                    } else if (data.requiresPayment) {
                        setPaymentData({
                            clientSecret: data.clientSecret,
                            paymentIntentId: data.paymentIntentId
                        });
                        setBookingStage("PAYMENT");
                    } else if (data.success) {
                        setBookingStage("SUCCESS");
                    }
                })
                .catch(err => setBookingError(t("errors.generic")));
        });
    };

    const handlePaymentSuccess = async (paymentIntentId: string) => {
<<<<<<< HEAD
        const res = await confirmPaymentAndBooking(paymentIntentId);
        if (res.success) {
            setBookingStage("SUCCESS");
        } else {
            setBookingError(res.error || t("errors.paymentFailed"));
        }
=======
        // Booking is already created with PENDING status
        // Webhook will update to PAID when payment is confirmed
        setBookingStage("SUCCESS");
>>>>>>> master
    };

    // Auto-fill form if session exists
    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || "");
            setEmail(session.user.email || "");
            setIsEmailVerified(true);
        }
    }, [session]);

    if (bookingStage === "SUCCESS") {
        return (
            <div className="flex flex-col items-center justify-center h-full animate-in fade-in zoom-in-95 duration-500">
                <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 ring-4 ring-green-500/20 z-10 relative">
                        <Check className="h-10 w-10 text-white animate-in zoom-in spin-in-12 duration-700" strokeWidth={3} />
                    </div>
                </div>

                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-2">
                    {t("successTitle")}
                </h2>

                <p className="text-muted-foreground text-center max-w-sm mb-8 text-lg">
                    {t("successDesc")}
                </p>

                <div className="bg-muted/30 backdrop-blur-sm border border-border p-6 rounded-2xl w-full max-w-sm space-y-4 mb-8">
                    <div className="flex justify-between items-center border-b border-border/50 pb-3">
                        <span className="text-muted-foreground text-sm font-medium">{t("service")}</span>
                        <span className="font-semibold text-foreground">{service.title}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border/50 pb-3">
                        <span className="text-muted-foreground text-sm font-medium">{t("date")}</span>
                        <span className="font-semibold text-foreground">{date ? format(date, "MMM d, yyyy", { locale: dateLocale }) : ""}</span>
                    </div>
                    <div className="flex justify-between items-center max-w-full">
                        <span className="text-muted-foreground text-sm font-medium w-1/3">{t("time")}</span>
                        <span className="font-semibold text-foreground w-2/3 text-right truncate">{selectedSlot}</span>
                    </div>
                </div>

                <Button
                    onClick={() => window.location.reload()}
                    className="bg-foreground text-background hover:bg-foreground/90 font-semibold px-8 rounded-full shadow-lg"
                >
                    {t("bookAnother")}
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row h-full gap-6">
            <div className="md:w-[350px] flex-shrink-0 flex justify-center border-r md:pr-6">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border shadow-sm p-4"
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    locale={dateLocale}
                />
            </div>

            <div className="flex-1 overflow-y-auto">
                <h3 className="font-semibold mb-4 text-lg">
                    {date ? format(date, "EEEE, MMMM d", { locale: dateLocale }) : t("selectDate")}
                </h3>

                {loadingSlots ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        {bookingStage === "SLOT" && (
                            <>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                    {slots.length === 0 ? (
                                        <p className="col-span-full text-muted-foreground text-center py-10">{t("noSlots")}</p>
                                    ) : (
                                        slots.map((slot) => (
                                            <Button
                                                key={slot.time}
                                                variant={selectedSlot === slot.time ? "default" : "outline"}
                                                className={`w-full h-auto py-3 flex flex-col items-center gap-1 ${selectedSlot === slot.time ? "bg-primary text-primary-foreground" : ""}`}
                                                onClick={() => handleSlotClick(slot.time)}
                                            >
                                                <span className="text-base font-medium">{slot.time}</span>
                                                <span className="text-xs opacity-70">
                                                    {t("spotsLeft", { count: slot.spots })}
                                                </span>
                                            </Button>
                                        ))
                                    )}
                                </div>

                                {/* TimeZone Warning */}
                                {(() => {
                                    const clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                                    const providerTimeZone = user.timeZone || "UTC";

                                    console.log("[TimeZone Debug]", { client: clientTimeZone, provider: providerTimeZone, mismatch: clientTimeZone !== providerTimeZone });

                                    if (date && clientTimeZone !== providerTimeZone) {
                                        return (
                                            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-600 dark:text-yellow-400 animate-in fade-in slide-in-from-top-2">
                                                <p className="font-semibold flex items-center gap-2">
                                                    <span className="text-lg">⚠️</span> {t("timeZoneWarning")}
                                                </p>
                                                <div className="mt-1 space-y-1 opacity-90">
                                                    <p>{t("providerTimeZone")}: <strong>{providerTimeZone}</strong></p>
                                                    <p>{t("clientTimeZone")}: <strong>{clientTimeZone}</strong></p>
                                                    <p className="text-xs mt-2 italic">
                                                        * {t("timeZoneNote")}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </>
                        )}

                        {bookingStage === "AUTH" && (
                            <div className="flex justify-center w-full">
                                <ClientAuthDialog
                                    onSuccess={(verifiedEmail) => {
                                        setEmail(verifiedEmail);
                                        setIsEmailVerified(true);
                                        setBookingStage("FORM");
                                    }}
                                    onBack={() => setBookingStage("SLOT")}
                                />
                            </div>
                        )}

                        {bookingStage === "FORM" && (
                            <div className="max-w-md space-y-4 animate-in fade-in slide-in-from-right-4">
                                <div className="mb-4 p-3 bg-muted/50 border rounded text-sm space-y-2">
                                    <div>
                                        <span className="font-semibold text-gray-700">{t("selectedTime")}:</span> {date && format(date, "MMM d", { locale: dateLocale })} @ {selectedSlot}
                                        <Button variant="link" size="sm" onClick={() => setBookingStage("SLOT")} className="ml-2 text-sky-600 p-0 h-auto">{t("change")}</Button>
                                    </div>
                                </div>

                                {/* Custom / Standard Fields */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>{t("yourName")} <span className="text-red-500">*</span></Label>
                                        <Input placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} disabled={isBooking} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t("email")} <span className="text-red-500">*</span></Label>
                                        <Input
                                            type="email"
                                            placeholder="john@example.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            disabled={isBooking || isEmailVerified}
                                            className={isEmailVerified ? "bg-muted text-muted-foreground opacity-100" : ""}
                                        />
                                    </div>

                                    {service.locationType === "PHONE" && (
                                        <div className="space-y-2">
                                            <Label>{t("phone")} <span className="text-red-500">*</span></Label>
                                            <PhoneInput
                                                placeholder={t("enterPhone")}
                                                value={clientPhone}
                                                onChange={setClientPhone}
                                                disabled={isBooking}
                                                defaultCountry="US"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label>{t("notes")}</Label>
                                        <Textarea placeholder={t("notesPlaceholder")} value={notes} onChange={e => setNotes(e.target.value)} disabled={isBooking} />
                                    </div>
                                </div>

                                <FormError message={bookingError} />

                                <div className="pt-2 flex gap-3">
                                    <Button variant="ghost" onClick={() => setBookingStage("SLOT")} disabled={isBooking}>{t("back")}</Button>
                                    <Button className="flex-1" onClick={handleConfirmBooking} disabled={isBooking}>
                                        {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {service.requiresPayment ? t("payAndConfirm", { price: service.price }) : t("confirm")}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {bookingStage === "PAYMENT" && paymentData && (
                            <div className="max-w-md space-y-6 animate-in fade-in slide-in-from-right-4">
                                <div className="p-4 bg-muted/50 border rounded-xl flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <CreditCard className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-lg text-foreground">{t("securePayment")}</p>
                                        <p className="text-sm text-muted-foreground">{t("paymentDesc")} <strong>${service.price}</strong></p>
                                    </div>
                                </div>

                                <Elements
                                    stripe={stripePromise}
                                    options={{
                                        clientSecret: paymentData.clientSecret,
                                        appearance: { theme: 'stripe' }
                                    }}
                                >
                                    <CheckoutForm
                                        clientSecret={paymentData.clientSecret}
                                        onSuccess={handlePaymentSuccess}
                                        onCancel={() => setBookingStage("FORM")}
                                    />
                                </Elements>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div >
    );
}
