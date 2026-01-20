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
                // Scenario 1: Email + Password
                const parsedCredentials = z.object({
                    email: z.string().email(),
                    password: z.string().min(6)
                }).safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await prisma.user.findUnique({ where: { email } });

                    if (!user || !user.password) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (passwordsMatch) return user;
                }

                // Scenario 2: Email + OTP (Client Quick Auth)
                const parsedOtp = z.object({
                    email: z.string().email(),
                    otp: z.string().length(6)
                }).safeParse(credentials);

                if (parsedOtp.success) {
                    const { email, otp } = parsedOtp.data;

                    // Verify Token against DB
                    const tokenRecord = await prisma.verificationToken.findFirst({
                        where: {
                            identifier: email,
                            token: otp
                        }
                    });

                    if (!tokenRecord) return null;

                    const hasExpired = new Date(tokenRecord.expires) < new Date();
                    if (hasExpired) {
                        return null; // Or throw error to be handled
                    }

                    // Token Valid -> Find or Create User
                    let user = await prisma.user.findUnique({ where: { email } });

                    if (!user) {
                        // Create user implicitly if not found (Should ideally be handled by verifyClientOtp action but auth flow can do it too)
                        user = await prisma.user.create({
                            data: {
                                email,
                                emailVerified: new Date(),
                                name: email.split("@")[0],
                                role: "CLIENT" as any
                            }
                        });
                    } else {
                        // Verify email if not
                        if (!user.emailVerified) {
                            await prisma.user.update({
                                where: { id: user.id },
                                data: { emailVerified: new Date() }
                            });
                        }
                    }

                    // Delete used token
                    await prisma.verificationToken.delete({
                        where: {
                            identifier_token: {
                                identifier: email,
                                token: otp,
                            }
                        }
                    });

                    return user;
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
                token.emailVerified = (user as any).emailVerified;
                token.role = (user as any).role;
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
                    token.role = (freshUser as any).role;
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
                    (session.user as any).address = user.address;
                    (session.user as any).phone = user.phone;
                    (session.user as any).role = (user as any).role;
                }
            }
            return session;
        },
    },
    events: {
        async linkAccount({ user }) {
            await prisma.user.update({
                where: { id: user.id },
                data: { emailVerified: new Date() }
            })
        },
        async createUser({ user }) {
            const userCount = await prisma.user.count();
            if (userCount === 1) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { role: "ADMIN" } as any
                });
            } else {
                // Default to OWNER for all standard signups (OAuth/Credentials)
                // This ensures they get Dashboard access.
                // Clients will be created explicitly with 'CLIENT' role in the booking flow.
                await prisma.user.update({
                    where: { id: user.id },
                    data: { role: "OWNER" } as any
                });
            }
        }
    }
})
