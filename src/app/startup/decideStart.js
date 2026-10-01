import { env } from '@core/config/env.js';
import { isPWAInstalled } from '@core/pwa/isPWAInstalled.js';
import { sessionManager } from '@features/auth/session/sessionManager.js';

// The one routing decision made on every launch (Plan 4h). Step 5e adds "setup done?" and "locked?" to it.
// Returns where the person lands: 'home' (signed in), 'welcome' (not signed in), or null in a browser tab,
// where Onboarding and Install are the right screens and there is nothing to decide.
export function decideStart() {
  const installed = env.skipInstallGuard || isPWAInstalled(); // the same test as InstallGuard, dev bypass included
  if (!installed) return null;
  return sessionManager.hasSession() ? 'home' : 'welcome';
}
