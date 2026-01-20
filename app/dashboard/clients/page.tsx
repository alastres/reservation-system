import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MotionDiv, staggerContainer, slideUp } from "@/components/ui/motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { columns, Client } from "./columns";
import { DataTable } from "./data-table";

export default async function ClientsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/auth/login");
    }

    const allBookings = await prisma.booking.findMany({
        where: {
            service: {
                userId: session.user.id,
            },
        },
        orderBy: {
            startTime: "desc",
        },
        select: {
            clientEmail: true,
            clientName: true,
            clientPhone: true,
            startTime: true,
            status: true
        }
    });

    // Aggregate clients
    const clientsMap = new Map<string, Client>();

    allBookings.forEach(booking => {
        if (!clientsMap.has(booking.clientEmail)) {
            clientsMap.set(booking.clientEmail, {
                email: booking.clientEmail,
                name: booking.clientName,
                phone: booking.clientPhone,
                lastBooking: booking.startTime,
                totalBookings: 0,
                status: "Active"
            });
        }
        const client = clientsMap.get(booking.clientEmail)!;
        client.totalBookings += 1;
        // Keep the latest date (query is desc so first one is latest, but strictly...)
        if (booking.startTime > client.lastBooking) {
            client.lastBooking = booking.startTime;
        }
    });

    const clients = Array.from(clientsMap.values());

    return (
        <MotionDiv
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="flex-1 space-y-4 p-4 md:p-8 pt-6"
        >
            <MotionDiv variants={slideUp} className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                    Clients
                </h2>
                <p className="text-muted-foreground">
                    You have {clients.length} unique clients.
                </p>
            </MotionDiv>

            <MotionDiv variants={slideUp}>
                <Card>
                    <CardHeader>
                        <CardTitle>Client List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} data={clients} />
                    </CardContent>
                </Card>
            </MotionDiv>
        </MotionDiv>
    );
}
