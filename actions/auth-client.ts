"use server";

import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/mail";
import { getUserByEmail } from "@/data/user";

// Schema for email input
const EmailSchema = z.object({
    email: z.string().email({
        message: "Email is required",
    }),
});

const OtpSchema = z.object({
    email: z.string().email(),
    code: z.string().length(6, "Code must be 6 digits"),
});

export const sendClientOtp = async (email: string) => {
    const validatedFields = EmailSchema.safeParse({ email });

    if (!validatedFields.success) {
        return { error: "Invalid email!" };
    }

    const { email: validEmail } = validatedFields.data;

    try {
        const token = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(new Date().getTime() + 15 * 60 * 1000); // 15 mins

        // Delete existing token
        await prisma.verificationToken.deleteMany({
            where: { identifier: validEmail }
        });

        await prisma.verificationToken.create({
            data: {
                identifier: validEmail,
                token,
                expires,
            }
        });

        await sendOtpEmail(validEmail, token);

        return { success: "OTP sent!" };
    } catch (error) {
        return { error: "Failed to send OTP" };
    }
};

export const verifyClientOtp = async (values: z.infer<typeof OtpSchema>) => {
    const validatedFields = OtpSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { email, code } = validatedFields.data;

    const existingToken = await prisma.verificationToken.findUnique({
        where: {
            identifier_token: {
                identifier: email,
                token: code,
            }
        }
    });

    if (!existingToken) {
        return { error: "Invalid code!" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
        return { error: "Code expired!" };
    }

    // Token is valid. Now handle user.
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
        // User exists. verify email if not already.
        if (!existingUser.emailVerified) {
            await prisma.user.update({
                where: { id: existingUser.id },
                data: { emailVerified: new Date() }
            });
        }

        await prisma.verificationToken.delete({
            where: {
                identifier_token: {
                    identifier: email,
                    token: code,
                }
            }
        });

        return { success: "Verified!", email };
    } else {
        // New User
        await prisma.user.create({
            data: {
                email,
                emailVerified: new Date(),
                name: email.split("@")[0], // Placeholder name
                role: "CLIENT" as any // Explicitly set CLIENT
            }
        });

        await prisma.verificationToken.delete({
            where: {
                identifier_token: {
                    identifier: email,
                    token: code,
                }
            }
        });

        return { success: "Verified and Created!", email };
    }
};
