import authConfig from "./auth.config";
import NextAuth from "next-auth";
import {
  apiAuthPrefix,
  AUTH_ROUTES,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  publicRoutes,
} from "./routes";
import createNextIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const { auth } = NextAuth(authConfig);

const handleI18nRouting = createNextIntlMiddleware(routing);

export default auth((req) => {
  const { nextUrl, auth } = req;
  const locale = req.cookies.get("NEXT_LOCALE")?.value || "en";
  const isContainsLocale = nextUrl.pathname.startsWith(`/${locale}`);
  const pathnameWithoutLocale = nextUrl.pathname.replace(`/${locale}`, "");

  const IS_LOGGED_IN = !!auth;

  const isApiAuthRoute = pathnameWithoutLocale.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(pathnameWithoutLocale);
  const isAuthRoute = authRoutes.includes(pathnameWithoutLocale);

  if (isApiAuthRoute) {
    return;
  }

  if (!isContainsLocale) {
    console.log("redirecting to locale", locale);
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

  if (!IS_LOGGED_IN && !isPublicRoute) {
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
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
