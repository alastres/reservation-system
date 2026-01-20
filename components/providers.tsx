"use client";

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/theme-provider"

export const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <SessionProvider refetchOnWindowFocus={true} refetchInterval={5 * 60}>
            <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
            >
                {children}
            </ThemeProvider>
        </SessionProvider>
    )
}
