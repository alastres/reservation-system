import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import createMiddleware from "next-intl/middleware";
import {
    DEFAULT_LOGIN_REDIRECT,
    apiAuthPrefix,
    authRoutes,
    publicRoutes,
} from "@/routes";

const { auth } = NextAuth(authConfig);

const intlMiddleware = createMiddleware({
    locales: ["en", "es"],
    defaultLocale: "es",
    localePrefix: "always"
});

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const userRole = (req.auth?.user as any)?.role;

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);

    // Remove locale prefix to check routes against our list
    // e.g. /es/dashboard -> /dashboard
    const publicPathname = nextUrl.pathname.replace(/^\/(en|es)/, "");
    const isPublicRoute = publicRoutes.includes(publicPathname) || publicPathname === ""; // Handle root
    // Also handling explicit public routes that might be same as root or logic needs care.
    // routes.ts likely has "/" in publicRoutes.

    const isAuthRoute = authRoutes.includes(publicPathname);
    const isDashboardRoute = publicPathname.startsWith("/dashboard");

    if (isApiAuthRoute) {
        return undefined;
    }

    if (isAuthRoute) {
        if (isLoggedIn) {
            if (userRole === "CLIENT") {
                // Use absolute URL or let intl handle it?
                // next-intl expects locale.
                return Response.redirect(new URL("/es/", nextUrl));
            }
            return Response.redirect(new URL(`/es${DEFAULT_LOGIN_REDIRECT}`, nextUrl));
        }
        return intlMiddleware(req);
    }

    // Protection Logic
    if (isDashboardRoute || publicPathname.startsWith("/admin")) { // Check unwrapped path
        if (!isLoggedIn) {
            // Redirect to Login (preserving locale if possible, defaulting to es)
            // We can extract locale from path or default.
            const locale = nextUrl.pathname.split("/")[1] || "es";
            let callbackUrl = nextUrl.pathname;
            if (nextUrl.search) callbackUrl += nextUrl.search;
            const encodedCallbackUrl = encodeURIComponent(callbackUrl);

            return Response.redirect(new URL(`/${locale}/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
        }
        if (userRole === "CLIENT") {
            return Response.redirect(new URL("/es/", nextUrl));
        }
    }

    return intlMiddleware(req);
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
