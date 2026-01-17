"use server";

import { prisma } from "@/lib/prisma";
import { prisma as db } from "@/lib/prisma"; // Alias if needed, but standardizing
// Actually no duplicate

export const newVerification = async (token: string) => {
    const existingToken = await prisma.verificationToken.findFirst({
        where: { token }
    });

    if (!existingToken) {
        return { error: "Token does not exist!" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
        return { error: "Token has expired!" };
    }

    const existingUser = await prisma.user.findFirst({
        where: { email: existingToken.identifier }
    });

    if (!existingUser) {
        return { error: "Email does not exist!" };
    }

    await prisma.user.update({
        where: { id: existingUser.id },
        data: {
            emailVerified: new Date(),
            email: existingToken.identifier, // Update email in case of email change flow (reuse logic)
        }
    });

    await prisma.verificationToken.delete({
        where: {
            identifier_token: {
                identifier: existingToken.identifier,
                token: existingToken.token
            }
        }
    });

    return { success: "Email verified!" };
};
