"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { RegisterSchema } from "@/schemas";
import { prisma } from "@/lib/prisma";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

import { getTranslations } from "next-intl/server";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
    const validatedFields = RegisterSchema.safeParse(values);
    const t = await getTranslations("Auth");

    if (!validatedFields.success) {
        return { error: t("invalidFields") };
    }

    const { email, password, name, timeZone } = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
        return { error: t("emailInUse") };
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
            timeZone: timeZone || "UTC",
        },
    });

    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(
        verificationToken.identifier,
        verificationToken.token,
    );

    return { success: t("confirmationSent") };
};
