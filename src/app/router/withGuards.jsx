import { ROUTES } from './routes.js';
import AuthGuard from './guards/AuthGuard.jsx';
import InstallGuard from './guards/InstallGuard.jsx';
import SetupGuard from './guards/SetupGuard.jsx';
import UnlockGuard from './guards/UnlockGuard.jsx';

// Wraps a route's element in the guards its flags ask for. Outermost first, so the cheap checks run before the
// request: installed, authenticated, unlocked, then setupComplete (the only one that calls the server).
export function withGuards({ installed, authenticated, unlocked, setupComplete }, element) {
  let guarded = element;
  if (setupComplete) guarded = <SetupGuard redirectTo={ROUTES.setupIncome}>{guarded}</SetupGuard>;
  if (unlocked) guarded = <UnlockGuard redirectTo={ROUTES.unlock}>{guarded}</UnlockGuard>;
  if (authenticated) guarded = <AuthGuard redirectTo={ROUTES.welcome} sessionEndedTo={ROUTES.login}>{guarded}</AuthGuard>;
  if (installed) guarded = <InstallGuard redirectTo={ROUTES.install}>{guarded}</InstallGuard>;
  return guarded;
}
