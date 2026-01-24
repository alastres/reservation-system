import { ServiceForm } from "@/components/services/service-form";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

interface ServiceEditPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ServiceEditPage({ params }: ServiceEditPageProps) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/auth/login");
    }

    const { id } = await params;

    const service = await prisma.service.findUnique({
        where: {
            id,
            userId: session.user.id,
        },
    });

    if (!service) {
        redirect("/dashboard/services");
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Edit Service</h1>
            <ServiceForm key={service.id} service={{
                ...service,
                customInputs: service.customInputs as any[],
                maxRecurrenceCount: service.maxRecurrenceCount || 4
            }} />
        </div>
    );
}
