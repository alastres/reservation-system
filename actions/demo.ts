"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role, SubscriptionPlan, SubscriptionStatus, LocationType } from "@prisma/client";

const DEMO_EMAIL = "demo@scheduler.com";
const DEMO_PASSWORD = "demo1234";

export const resetDemoAccount = async () => {
    try {
        // 1. Check if demo user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: DEMO_EMAIL }
        });

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

        if (existingUser) {
            // Delete all data associated with demo user
            // Delete bookings where user is the provider
            // We need to find services first

            // Transaction to clean up
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

                // Clean up other related data to ensure fresh state
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
                        image: null,
                        password: hashedPassword,
                        subscriptionPlan: SubscriptionPlan.PRO,
                        subscriptionStatus: SubscriptionStatus.ACTIVE,
                    }
                });
            });

            console.log("Demo user cleaned.");
        } else {
            // Create new if doesn't exist (handled below in recreation)
            console.log("Demo user not found, will create.");
        }

        // 3. Re-create Demo Data (User & Services)
        // If user exists, we just update/upsert. If not, create.
        // Actually simpler to just upsert the user and then create services.

        const user = await prisma.user.upsert({
            where: { email: DEMO_EMAIL },
            update: {
                name: "Demo User",
                username: "demo_user",
                password: hashedPassword, // Ensure password is correct
                emailVerified: new Date(),
                role: Role.OWNER,
                subscriptionPlan: SubscriptionPlan.PRO,
                subscriptionStatus: SubscriptionStatus.ACTIVE,
            },
            create: {
                email: DEMO_EMAIL,
                name: "Demo User",
                username: "demo_user",
                password: hashedPassword,
                emailVerified: new Date(),
                role: Role.OWNER,
                subscriptionPlan: SubscriptionPlan.PRO,
                subscriptionStatus: SubscriptionStatus.ACTIVE,
            }
        });

        // Create Default Services
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

        // Create Default Availability (Mon-Fri, 9-17)
        await prisma.availabilityRule.createMany({
            data: [1, 2, 3, 4, 5].map((day) => ({
                userId: user.id,
                dayOfWeek: day,
                startTime: "09:00",
                endTime: "17:00",
            }))
        });

        console.log("Demo account reset successfully.");
        return { success: true };

    } catch (error) {
        console.error("Error resetting demo account:", error);
        return { error: "Failed to reset demo account" };
    }
};
