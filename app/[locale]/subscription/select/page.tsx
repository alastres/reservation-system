"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState } from "react";
import { createSubscriptionCheckout } from "@/actions/subscription";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Plan {
    id: "FREE" | "PRO" | "BUSINESS";
    name: string;
    price: string; // Display price
    period: string;
    description: string;
    features: string[];
    popular: boolean;
    originalPrice?: string;
    discount?: string;
}

const plans: Plan[] = [
    {
        id: "FREE",
        name: "Gratis",
        price: "€0",
        period: "/mes",
        description: "Para individuos que empiezan",
        features: [
            "1 Servicio",
            "Gestión de reservas básica",
            "Página de perfil básica",
            "Notificaciones por email",
        ],
        popular: false,
    },
    {
        id: "PRO",
        name: "Profesional",
        price: "€15",
        period: "/mes",
        description: "Para profesionales activos",
        features: [
            "Servicios ilimitados",
            "Reservas ilimitadas",
            "Integración Google Calendar",
            "Soporte prioritario",
        ],
        popular: true,
        originalPrice: "€20",
        discount: "-25%"
    },
    {
        id: "BUSINESS",
        name: "Empresa",
        price: "€49",
        period: "/mes",
        description: "Para equipos y negocios",
        features: [
            "Todo lo de Profesional",
            "Múltiples empleados (Próximamente)",
            "Gestión de equipos",
            "Múltiples centros / ubicaciones",
            "Administración centralizada",
        ],
        popular: false,
    },
];

export default function SelectPlanPage() {
    const [loading, setLoading] = useState<string | null>(null);
    const router = useRouter();

    const handleSelectPlan = async (planId: "FREE" | "PRO" | "BUSINESS") => {
        setLoading(planId);

        try {
            const result = await createSubscriptionCheckout(planId);

            if (result.error) {
                toast.error(result.error);
                return;
            }

            if (result.url) {
                window.location.href = result.url;
            }
        } catch (error) {
            console.error("Subscription flow error:", error);
            toast.error("Error al crear sesión de pago");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Elige tu plan</h1>
                    <p className="text-xl text-muted-foreground">
                        Empieza a monetizar tus servicios hoy mismo
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={`relative ${plan.popular ? "border-primary shadow-lg scale-105" : ""
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                                        Más Popular
                                    </div>
                                </div>
                            )}

                            <CardHeader>
                                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                                <div className="mt-4">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-bold">{plan.price}</span>
                                        <span className="text-muted-foreground">{plan.period}</span>
                                    </div>
                                    {plan.originalPrice && (
                                        <div className="mt-2">
                                            <span className="text-sm line-through text-muted-foreground mr-2">
                                                {plan.originalPrice}
                                            </span>
                                            <span className="text-sm font-medium text-green-600">
                                                {plan.discount}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent>
                                <Button
                                    className="w-full mb-6"
                                    size="lg"
                                    onClick={() => handleSelectPlan(plan.id as any)}
                                    disabled={loading !== null}
                                    variant={plan.popular ? "default" : "outline"}
                                >
                                    {loading === plan.id ? "Procesando..." : "Seleccionar Plan"}
                                </Button>

                                <ul className="space-y-3">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-12 text-center text-sm text-muted-foreground">
                    <p>Todos los planes incluyen:</p>
                    <p>✓ Servicios y reservas ilimitadas ✓ Sin comisiones por transacción ✓ Cancela cuando quieras</p>
                </div>
            </div>
        </div>
    );
}
