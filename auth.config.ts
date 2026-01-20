import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { z } from "zod"

export default {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
            authorization: {
                params: {
                    scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events",
                    access_type: "offline",
                    prompt: "consent",
                }
            }
        }),
        Credentials({
            async authorize(credentials) {
                const parsed = z.object({
                    email: z.string().email(),
                    password: z.string().min(6)
                }).safeParse(credentials);

                if (parsed.success) {
                    // Note: In a real implementation, we would verify against the DB here.
                    // However, since this file is used in Middleware (Edge), we cannot use Prisma Client directly here easily
                    // unless we use an Edge-compatible adapter or fetch/API.
                    // For this setup, we will perform the robust check in the main auth.ts or separate logic.
                    // For now, we return null to force secure implementation later or strictly follow the split pattern.
                    return null;
                }
                return null;
            },
        }),
    ],
    pages: {
        signIn: "/auth/login",
        error: "/auth/error",
    },
    callbacks: {
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
                // Pass emailVerified from token to session (for middleware)
                (session.user as any).emailVerified = token.emailVerified;
                (session.user as any).role = token.role;
            }
            return session;
        },
        async jwt({ token }) {
            return token;
        }
    }
} satisfies NextAuthConfig
