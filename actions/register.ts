"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { RegisterSchema } from "@/schemas";
import { prisma } from "@/lib/prisma";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
    const validatedFields = RegisterSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { email, password, name } = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
        return { error: "Email already in use!" };
    }

    // Generate username from email + random suffix
    const username = email.split("@")[0] + "-" + Math.floor(Math.random() * 10000);

    // Initial Admin Check: If no users exist, the first one becomes ADMIN
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? "ADMIN" : "OWNER";

    await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: role as any,
        },
    });

    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(
        verificationToken.identifier,
        verificationToken.token,
    );

    return { success: "Confirmation email sent!" };
};
