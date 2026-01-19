
"use server";

import { auth } from "@/lib/auth";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export const resendVerificationEmail = async () => {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
        return { error: "Unauthorized" };
    }

    const email = session.user.email;

    try {
        const verificationToken = await generateVerificationToken(email);
        await sendVerificationEmail(verificationToken.identifier, verificationToken.token);
        return { success: "Verification email sent!" };
    } catch (error) {
        console.error("Failed to resend verification email:", error);
        return { error: "Failed to send verification email" };
    }
}
