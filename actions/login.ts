"use server";

import * as z from "zod";
import { LoginSchema } from "@/schemas";
import { signIn } from "@/lib/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";

import { getTranslations } from "next-intl/server";

export const login = async (values: z.infer<typeof LoginSchema>) => {
    const validatedFields = LoginSchema.safeParse(values);
    const t = await getTranslations("Auth");

    if (!validatedFields.success) {
        return { error: t("invalidFields") };
    }

    const { email, password } = validatedFields.data;

    try {
        await signIn("credentials", {
            email,
            password,
            redirect: false,
        });
        return { success: t("loginSuccess") };
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: t("invalidCredentials") };
                default:
                    return { error: t("somethingWentWrong") };
            }
        }
        throw error;
    }
};
