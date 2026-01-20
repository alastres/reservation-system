import { Role } from "@prisma/client"
import NextAuth, { DefaultSession } from "next-auth"

export type ExtendedUser = DefaultSession["user"] & {
    role: Role
    username: string
    language: string
    timeZone: string
    emailVerified: Date | null
    address: string | null
    phone: string | null
}

declare module "next-auth" {
    interface Session {
        user: ExtendedUser
    }
}
