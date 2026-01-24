import { prisma } from "@/lib/prisma";

export const generateVerificationToken = async (email: string) => {
    // Generate 6 digit code
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(new Date().getTime() + 15 * 60 * 1000); // 15 minutes expiration for OTP

    const existingToken = await prisma.verificationToken.findFirst({
        where: { identifier: email }
    });

    if (existingToken) {
        await prisma.verificationToken.delete({
            where: {
                identifier_token: {
                    identifier: existingToken.identifier,
                    token: existingToken.token,
                }
            }
        });
    }

    const verificationToken = await prisma.verificationToken.create({
        data: {
            identifier: email,
            token,
            expires
        }
    });

    return verificationToken;
};
