// Every path in the app, in one place. Nothing else writes a path as a string: a mistyped literal fails silently
// into the catch-all route. Screens receive these as props or import ROUTES; ROUTE_CONFIG (Step 5b) is built from them.
// The side panel is not here: it slides over Home with no route change.
export const ROUTES = Object.freeze({
  // Before sign-in
  onboarding: '/',
  install: '/install',
  welcome: '/welcome',

  // Account
  register: '/register',
  verifyPhone: '/verify-phone',
  login: '/login',
  forgotPassword: '/forgot-password',
  verifyResetCode: '/forgot-password/verify',
  createNewPassword: '/forgot-password/new-password',

  // First-run setup
  setupIncome: '/setup/income',
  setupObligations: '/setup/obligations',
  setupLock: '/setup/lock',

  // App lock. setPin is reached from setup and from Settings, Security.
  setPin: '/set-pin',
  unlock: '/unlock',

  // The app
  home: '/home',
  reports: '/reports',
  reportDetail: '/reports/:date',
  insights: '/insights',
  behavior: '/behavior',

  // Settings
  settings: '/settings',
  settingsIncome: '/settings/income',
  settingsAccount: '/settings/account',
  settingsSecurity: '/settings/security',
  changePin: '/settings/security/change-pin',
  settingsAppearance: '/settings/appearance',
  settingsAbout: '/settings/about',

  // Development only: App.jsx adds this route in dev builds.
  gallery: '/gallery',
});

// The one path with a parameter. date: yyyy-MM-dd.
export const reportDetailPath = (date) => ROUTES.reportDetail.replace(':date', encodeURIComponent(date));
