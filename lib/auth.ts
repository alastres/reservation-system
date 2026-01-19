import NextAuth from "next-auth"
import authConfig from "@/auth.config"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    ...authConfig,
    providers: [
        ...authConfig.providers.filter((p: any) => p.id !== "credentials"),
        Credentials({
            async authorize(credentials) {
                const parsed = z.object({
                    email: z.string().email(),
                    password: z.string().min(6)
                }).safeParse(credentials);

                if (parsed.success) {
                    const { email, password } = parsed.data;
                    const user = await prisma.user.findUnique({ where: { email } });

                    if (!user || !user.password) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (passwordsMatch) return user;
                }
                return null;
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Initial sign in
            if (user) {
                token.sub = user.id;
                token.email = user.email;
                token.emailVerified = user.emailVerified;
            }

            // Refetch user on session update
            if (trigger === "update") {
                console.log("[AUTH] Trigger update received. Token sub:", token.sub);
                const freshUser = await prisma.user.findUnique({
                    where: { id: token.sub! }
                });
                console.log("[AUTH] Fresh user fetched:", freshUser?.email, "Verified:", freshUser?.emailVerified);

                if (freshUser) {
                    token.emailVerified = freshUser.emailVerified;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;

                // Fetch fresh data from DB to ensure session is up-to-date
                const user = await prisma.user.findUnique({
                    where: { id: token.sub },
                });

                if (user) {
                    session.user.name = user.name;
                    session.user.email = user.email;
                    session.user.image = user.image;
                    (session.user as any).username = user.username;
                    (session.user as any).language = user.language;
                    (session.user as any).timeZone = user.timeZone;
                    (session.user as any).emailVerified = user.emailVerified;
                }
            }
            return session;
        }
    },
    events: {
        async linkAccount({ user }) {
            await prisma.user.update({
                where: { id: user.id },
                data: { emailVerified: new Date() }
            })
        }
    }
})
