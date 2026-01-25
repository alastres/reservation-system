
import { PrismaClient, Role, SubscriptionPlan, SubscriptionStatus, LocationType } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@scheduler.com";
const DEMO_PASSWORD = "demo1234";

const resetDemoAccount = async () => {
    try {
        console.log("Starting demo account reset...");

        // 1. Check if demo user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: DEMO_EMAIL }
        });

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

        if (existingUser) {
            // Delete all data associated with demo user
            await prisma.$transaction(async (tx) => {
                // Delete all bookings for this user's services
                await tx.booking.deleteMany({
                    where: {
                        OR: [
                            { service: { userId: existingUser.id } }, // Bookings RECEIVED by demo user
                            { userId: existingUser.id }               // Bookings MADE by demo user (if any)
                        ]
                    }
                });

                // Delete all services
                await tx.service.deleteMany({
                    where: { userId: existingUser.id }
                });

                // Clean up other related data
                await tx.availabilityRule.deleteMany({
                    where: { userId: existingUser.id }
                });

                await tx.availabilityException.deleteMany({
                    where: { userId: existingUser.id }
                });

                await tx.notificationLog.deleteMany({
                    where: { userId: existingUser.id }
                });

                await tx.systemLog.deleteMany({
                    where: { userId: existingUser.id }
                });

                // Reset User Profile
                await tx.user.update({
                    where: { id: existingUser.id },
                    data: {
                        name: "Demo User",
                        username: "demo_user",
                        bio: "This is a demo account. Data is reset every hour.",
                        image: "https://cdn.pixabay.com/photo/2024/06/22/23/01/boy-8847075_1280.jpg",
                        coverImage: "https://images.unsplash.com/photo-1768675006364-a9286a8cb680?q=80&w=869&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                        password: hashedPassword,
                        subscriptionPlan: SubscriptionPlan.PRO,
                        subscriptionStatus: SubscriptionStatus.ACTIVE,
                        timeZone: "Europe/Madrid",
                        address: "Gran Vía 1, Madrid, España",
                        notificationPreferences: { email: false },
                        phone: "+34614567890",
                    }
                });
            });

            console.log("Demo user cleaned.");
        } else {
            console.log("Demo user not found, will create.");
        }

        // 3. Re-create Demo Data (User & Services)
        const user = await prisma.user.upsert({
            where: { email: DEMO_EMAIL },
            update: {
                name: "Demo User",
                username: "demo_user",
                password: hashedPassword,
                emailVerified: new Date(),
                role: Role.OWNER,
                image: "https://cdn.pixabay.com/photo/2024/06/22/23/01/boy-8847075_1280.jpg",
                coverImage: "https://images.unsplash.com/photo-1768675006364-a9286a8cb680?q=80&w=869&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                subscriptionPlan: SubscriptionPlan.PRO,
                subscriptionStatus: SubscriptionStatus.ACTIVE,
                timeZone: "Europe/Madrid",
                address: "Gran Vía 1, Madrid, España",
                notificationPreferences: { email: false },
                phone: "+34614567890",
            },
            create: {
                email: DEMO_EMAIL,
                name: "Demo User",
                username: "demo_user",
                password: hashedPassword,
                emailVerified: new Date(),
                role: Role.OWNER,
                image: "https://cdn.pixabay.com/photo/2024/06/22/23/01/boy-8847075_1280.jpg",
                coverImage: "https://images.unsplash.com/photo-1768675006364-a9286a8cb680?q=80&w=869&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                subscriptionPlan: SubscriptionPlan.PRO,
                subscriptionStatus: SubscriptionStatus.ACTIVE,
                timeZone: "Europe/Madrid",
                address: "Gran Vía 1, Madrid, España",
                notificationPreferences: { email: false },
                phone: "+34614567890",

            }
        });

        // Create Default Services (only if they don't exist, but we deleted them above so we should create them)
        // Check if services exist specifically for this user to be safe (though we deleted them)
        // Or just createMany.

        await prisma.service.createMany({
            data: [
                {
                    userId: user.id,
                    title: "Demo Consultation",
                    description: "A 30-minute demo consultation to test the booking flow.",
                    duration: 30,
                    price: 0,
                    url: "demo-consultation",
                    locationType: LocationType.GOOGLE_MEET,
                    location: "Google Meet",
                    isActive: true,
                },
                {
                    userId: user.id,
                    title: "Premium Strategy",
                    description: "Paid session example (Test mode).",
                    duration: 60,
                    price: 100,
                    url: "premium-strategy",
                    locationType: LocationType.IN_PERSON,
                    location: "Office",
                    isActive: true,
                }
            ]
        });

        // Create Default Availability
        await prisma.availabilityRule.createMany({
            data: [1, 2, 3, 4, 5].map((day) => ({
                userId: user.id,
                dayOfWeek: day,
                startTime: "09:00",
                endTime: "17:00",
            }))
        });

        console.log("Demo account reset successfully.");

    } catch (error) {
        console.error("Error resetting demo account:", error);
    } finally {
        await prisma.$disconnect();
    }
};

resetDemoAccount();
