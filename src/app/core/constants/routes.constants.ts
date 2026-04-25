/**
 * Constants for application routes to avoid magic strings.
 */
export const APP_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGN_IN: '/auth/sign-in',
  },
  TABS: {
    HOME: '/tabs/home',
    NOTIFICATIONS: '/tabs/notifications',
    MESSAGE: '/tabs/message',
    PROFILE: '/tabs/profile',
    ONBOARDING: '/tabs/onboarding',
  },
} as const;

/**
 * Routes that should trigger app exit on double back press.
 */
export const APP_EXIT_ROUTES = [
  APP_ROUTES.AUTH.LOGIN,
  APP_ROUTES.AUTH.SIGN_IN,
  APP_ROUTES.TABS.HOME,
  APP_ROUTES.TABS.NOTIFICATIONS,
  APP_ROUTES.TABS.MESSAGE,
  APP_ROUTES.TABS.PROFILE,
  APP_ROUTES.TABS.ONBOARDING,
] as const;
