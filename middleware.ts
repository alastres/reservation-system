
import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import {
    DEFAULT_LOGIN_REDIRECT,
    apiAuthPrefix,
    authRoutes,
    publicRoutes,
} from "@/routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const isVerified = Boolean((req.auth?.user as any)?.emailVerified);
    const userRole = (req.auth?.user as any)?.role;

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);
    const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");

    if (isApiAuthRoute) {
        return undefined;
    }

    if (isAuthRoute) {
        if (isLoggedIn) {
            // If Client, redirect to home instead of dashboard
            if (userRole === "CLIENT") {
                return Response.redirect(new URL("/", nextUrl));
            }
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
        }
        return undefined; // Allow access to auth pages if not logged in
    }

    // Only protect dashboard and admin routes
    // This allows public access to:
    // - Landing page (/)
    // - Public profiles (/[username])
    // - Service pages (/[username]/[service])
    if (isDashboardRoute || nextUrl.pathname.startsWith("/admin")) {
        if (!isLoggedIn) {
            let callbackUrl = nextUrl.pathname;
            if (nextUrl.search) {
                callbackUrl += nextUrl.search;
            }

            const encodedCallbackUrl = encodeURIComponent(callbackUrl);

            return Response.redirect(new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
        }

        // Restrict CLIENT users from accessing Dashboard/Admin
        if (userRole === "CLIENT") {
            return Response.redirect(new URL("/", nextUrl));
        }
    }

    return undefined; // Allow access
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
