import authConfig from "./auth.config";
import NextAuth from "next-auth";
import {
  apiAuthPrefix,
  AUTH_ROUTES,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  publicRoutes,
  guestRoutesPrefixes,
} from "./routes";
import createNextIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const { auth } = NextAuth(authConfig);

const handleI18nRouting = createNextIntlMiddleware(routing);

export default auth((req) => {
  const { nextUrl, auth } = req;

  // Check if it's an API route first, before any other processing
  if (nextUrl.pathname.startsWith("/api")) {
    return;
  }

  const locale = req.cookies.get("NEXT_LOCALE")?.value || "en";
  const isContainsLocale = nextUrl.pathname.startsWith(`/${locale}`);
  const pathnameWithoutLocale = nextUrl.pathname.replace(`/${locale}`, "");

  const IS_LOGGED_IN = !!auth;

  const isApiAuthRoute = pathnameWithoutLocale.startsWith(apiAuthPrefix);
  const isPublicRoute =
    publicRoutes.includes(pathnameWithoutLocale) ||
    pathnameWithoutLocale === "";
  const isAuthRoute = authRoutes.includes(pathnameWithoutLocale);
  const isGuestRoute = guestRoutesPrefixes.some((prefix) =>
    pathnameWithoutLocale.startsWith(prefix)
  );

  if (isApiAuthRoute) {
    return;
  }

  if (!isContainsLocale) {
    console.log("redirecting to locale", locale);
    return handleI18nRouting(req);
  }

  // Allow access to public routes (including landing page) without authentication
  if (isPublicRoute) {
    return handleI18nRouting(req);
  }

  // Allow guest routes without authentication (onboarding, guest reading)
  if (isGuestRoute) {
    return handleI18nRouting(req);
  }

  if (isAuthRoute) {
    if (pathnameWithoutLocale === AUTH_ROUTES.VERIFY_EMAIL) {
      return handleI18nRouting(req);
    }

    if (IS_LOGGED_IN) {
      return Response.redirect(
        new URL("/" + locale + "/" + DEFAULT_LOGIN_REDIRECT, nextUrl)
      );
    }
    return handleI18nRouting(req);
  }

  // Only redirect to login if user is not logged in and trying to access protected routes
  if (!IS_LOGGED_IN) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return Response.redirect(
      new URL(
        `/${locale}/auth/login?callbackUrl=${encodedCallbackUrl}`,
        nextUrl
      )
    );
  }

  return handleI18nRouting(req);
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // // Always run for API routes
    // "/(api|trpc)(.*)",
  ],
};

// export const config = {
//   // Match all pathnames except for
//   // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
//   // - … the ones containing a dot (e.g. `favicon.ico`)
//   matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
// };
