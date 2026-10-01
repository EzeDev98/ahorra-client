import { lazy, Suspense } from 'react';
import Onboarding from '@features/onboarding/Onboarding.jsx';
import VerifyPhone from "@features/auth/verification/VerifyPhone.jsx";
import Login from "@features/auth/login/Login.jsx";
import RequestReset from '@features/auth/passwordReset/RequestReset.jsx';
import VerifyResetCode from '@features/auth/passwordReset/VerifyResetCode.jsx';
import CreateNewPassword from '@features/auth/passwordReset/CreateNewPassword.jsx';
import { decideRoute } from "@app/startup/decideRoute.js";
import Register from "@features/auth/register/Register.jsx";
import Welcome from "@features/auth/welcome/Welcome.jsx";
import SetupIncome from '@features/setup/income/SetupIncome.jsx';
import SetupObligations from '@features/setup/obligations/SetupObligations.jsx';
import LockOffer from '@features/lock/LockOffer.jsx';
import Install from '@features/install/Install.jsx';
import RoutePlaceholder from './RoutePlaceholder.jsx';
import { ROUTES } from './routes.js';

// Every route as data: a path from ROUTES, the screen, and the guards it needs (see withGuards.jsx).
//   installed       the app must be running installed, not in a browser tab (InstallGuard, Step 4e)
//   authenticated   the person must be signed in (AuthGuard, Step 5c)
//   unlocked        if app lock is on, the app must be unlocked first (UnlockGuard, Step 5c)
//   setupComplete   income must already be set, or the person goes to the income setup (SetupGuard, Step 5c)
//   firstRunOnly    a first-run screen: once setup is finished it goes to Home (FirstRunGuard, Step 7d)
// A step that builds a screen replaces that route's `soon(...)` element and touches nothing else.
const OPEN = {}; // Onboarding, Install: reachable from a browser tab
const BEFORE_SIGN_IN = { installed: true };
const SIGNED_IN = { installed: true, authenticated: true }; // the unlock screen itself
const FIRST_RUN = { installed: true, authenticated: true, unlocked: true }; // setup screens and Set PIN: income may not be set yet
const SETUP_SCREEN = { ...FIRST_RUN, firstRunOnly: true }; // income, fixed obligations, the lock offer: only until setup is finished
const IN_APP = { ...FIRST_RUN, setupComplete: true }; // every other screen in the app

const soon = (name) => <RoutePlaceholder name={name} />;

// Dev only. import.meta.env.DEV is false in a production build, so the gallery is left out of it.
const ComponentGallery = import.meta.env.DEV ? lazy(() => import('@app/dev/gallery/ComponentGallery.jsx')) : null;

export const ROUTE_CONFIG = [
  { path: ROUTES.onboarding, ...OPEN, element: <Onboarding installTo={ROUTES.install} welcomeTo={ROUTES.welcome} /> },
  { path: ROUTES.install, ...OPEN, element: <Install backTo={ROUTES.onboarding} welcomeTo={ROUTES.welcome} /> },

  { path: ROUTES.welcome, ...BEFORE_SIGN_IN, element: <Welcome registerTo={ROUTES.register} loginTo={ROUTES.login} signedInTo={ROUTES.home} /> },
  { path: ROUTES.register, ...BEFORE_SIGN_IN, element: <Register backTo={ROUTES.welcome} verifyPhoneTo={ROUTES.verifyPhone} /> },
  { path: ROUTES.verifyPhone, ...BEFORE_SIGN_IN, element: <VerifyPhone welcomeTo={ROUTES.welcome} loginTo={ROUTES.login} /> },
  { path: ROUTES.login, ...BEFORE_SIGN_IN, element: <Login welcomeTo={ROUTES.welcome} forgotPasswordTo={ROUTES.forgotPassword} verifyPhoneTo={ROUTES.verifyPhone} homeTo={ROUTES.home} resolveDestination={() => decideRoute({ launching: true })} /> },
  { path: ROUTES.forgotPassword, ...BEFORE_SIGN_IN, element: <RequestReset backTo={ROUTES.login} verifyCodeTo={ROUTES.verifyResetCode} /> },
  { path: ROUTES.verifyResetCode, ...BEFORE_SIGN_IN, element: <VerifyResetCode requestTo={ROUTES.forgotPassword} newPasswordTo={ROUTES.createNewPassword} /> },
  { path: ROUTES.createNewPassword, ...BEFORE_SIGN_IN, element: <CreateNewPassword requestTo={ROUTES.forgotPassword} loginTo={ROUTES.login} /> },

  { path: ROUTES.setupIncome, ...SETUP_SCREEN, element: <SetupIncome nextTo={ROUTES.setupObligations} /> },
  { path: ROUTES.setupObligations, ...SETUP_SCREEN, element: <SetupObligations backTo={ROUTES.setupIncome} nextTo={ROUTES.setupLock} /> },
  { path: ROUTES.setupLock, ...SETUP_SCREEN, element: <LockOffer backTo={ROUTES.setupObligations} setPinTo={ROUTES.setPin} homeTo={ROUTES.home} /> },

  { path: ROUTES.setPin, ...FIRST_RUN, element: soon('Set PIN') },
  { path: ROUTES.unlock, ...SIGNED_IN, element: soon('Unlock') },

  { path: ROUTES.home, ...IN_APP, element: soon('Home') },
  { path: ROUTES.reports, ...IN_APP, element: soon('Reports') },
  { path: ROUTES.reportDetail, ...IN_APP, element: soon('Report') },
  { path: ROUTES.insights, ...IN_APP, element: soon('Insights') },
  { path: ROUTES.behavior, ...IN_APP, element: soon('Behaviour') },

  { path: ROUTES.settings, ...IN_APP, element: soon('Settings') },
  { path: ROUTES.settingsIncome, ...IN_APP, element: soon('Income') },
  { path: ROUTES.settingsAccount, ...IN_APP, element: soon('Account') },
  { path: ROUTES.settingsSecurity, ...IN_APP, element: soon('Security') },
  { path: ROUTES.changePin, ...IN_APP, element: soon('Change PIN') },
  { path: ROUTES.settingsAppearance, ...IN_APP, element: soon('Appearance') },
  { path: ROUTES.settingsAbout, ...IN_APP, element: soon('About') },

  ...(ComponentGallery
    ? [
        {
          path: ROUTES.gallery,
          ...OPEN,
          element: (
            <Suspense fallback={null}>
              <ComponentGallery />
            </Suspense>
          ),
        },
      ]
    : []),
];
