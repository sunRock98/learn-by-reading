/**
 * Public routes are routes that are accessible to everyone
 * These routes are not protected by authentication
 * @type {string[]}
 */

export const LANDING_PAGE = "/";

export const ONBOARDING = "/onboarding";

export const publicRoutes = [LANDING_PAGE, "", ONBOARDING];

/**
 * Guest routes allow unauthenticated users to access certain features
 * These are prefix-matched (any route starting with these paths is allowed)
 * @type {string[]}
 */
export const guestRoutesPrefixes = ["/guest/"];

/**
 * Auth routes are routes that are used for authentication
 * These routes will redirect to the settings page if the user is already authenticated
 * @type {string[]}
 */

export const AUTH_ROUTES = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  ERROR: "/auth/error",
  VERIFY_EMAIL: "/auth/verify-email",
  RESET: "/auth/reset",
  NEW_PASSWORD: "/auth/new-password",
};

export const authRoutes = Object.values(AUTH_ROUTES).map((route) => route);

/**
 * The prefix for API auth routes
 * @type {string}
 */

export const apiAuthPrefix = "/api/auth";

/**
 * The default redirect path after a successful login
 * @type {string}
 */

export const DEFAULT_LOGIN_REDIRECT = "/dashboard";

export const ROUTES = {
  Dashboard: "/dashboard",
  Settings: "/settings",
  LanguageSetting: "/languages",
  Dictionary: "/dictionary",
};
