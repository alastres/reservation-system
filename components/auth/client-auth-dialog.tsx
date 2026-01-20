"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendClientOtp, verifyClientOtp } from "@/actions/auth-client";
import { Loader2, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

interface ClientAuthDialogProps {
    onSuccess: (email: string) => void;
    onBack: () => void;
}

export function ClientAuthDialog({ onSuccess, onBack }: ClientAuthDialogProps) {
    const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleSendOtp = () => {
        if (!email) {
            toast.error("Please enter your email");
            return;
        }

        startTransition(() => {
            sendClientOtp(email).then((data) => {
                if (data.error) {
                    toast.error(data.error);
                } else {
                    toast.success("Code sent to your email!");
                    setStep("OTP");
                }
            });
        });
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            toast.error("Please enter a valid 6-digit code");
            return;
        }

        startTransition(async () => {
            // Attempt to sign in with OTP credentials
            // This relies on the 'credentials' provider configured in auth.ts to handle 'otp'
            try {
                const result = await signIn("credentials", {
                    email,
                    otp,
                    redirect: false,
                });

                if (result?.error) {
                    toast.error("Invalid Code or Expired");
                } else if (result?.ok) {
                    toast.success("Verified successfully!");
                    onSuccess(email);
                }
            } catch (error) {
                toast.error("An error occurred during verification.");
            }
        });
    };

    return (
        <div className="max-w-md w-full bg-slate-900/50 p-8 rounded-xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4">
                    <Mail className="h-6 w-6 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                    {step === "EMAIL" ? "Verify your Email" : "Enter Code"}
                </h2>
                <p className="text-slate-400 text-sm">
                    {step === "EMAIL"
                        ? "We'll send you a secure code to confirm your booking."
                        : `We sent a 6-digit code to ${email}`}
                </p>
            </div>

            <div className="space-y-4">
                {step === "EMAIL" ? (
                    <div className="space-y-2">
                        <Label className="text-slate-300">Email Address</Label>
                        <Input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isPending}
                            className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500 transition-colors h-12"
                        />
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Label className="text-slate-300">Verification Code</Label>
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="123456"
                                value={otp}
                                maxLength={6}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                disabled={isPending}
                                className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500 transition-colors h-12 text-center text-xl tracking-widest font-mono"
                            />
                        </div>
                        <div className="flex justify-between items-center text-xs mt-2">
                            <button onClick={() => setStep("EMAIL")} className="text-slate-500 hover:text-white transition-colors">
                                Change email
                            </button>
                            <button onClick={handleSendOtp} disabled={isPending} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                Resend code
                            </button>
                        </div>
                    </div>
                )}

                <Button
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
                    onClick={step === "EMAIL" ? handleSendOtp : handleVerifyOtp}
                    disabled={isPending}
                >
                    {isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <>
                            {step === "EMAIL" ? "Send Code" : "Verify & Continue"}
                            {!isPending && <ArrowRight className="ml-2 h-4 w-4" />}
                        </>
                    )}
                </Button>

                <Button variant="ghost" className="w-full text-slate-500 hover:text-white" onClick={onBack}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}
