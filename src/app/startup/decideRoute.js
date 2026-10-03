import { env } from '@core/config/env.js';
import { queryClient } from '@core/data/queryClient.js';
import { queryKeys } from '@core/data/queryKeys.js';
import { isPWAInstalled } from '@core/pwa/isPWAInstalled.js';
import { sessionManager } from '@features/auth/session/sessionManager.js';
import { lockState } from '@features/lock/lockState.js';
import { pinService } from '@features/lock/pinService.js';
import { pinStore } from '@features/lock/pinStore.js';
import { incomeApi } from '@features/setup/api/incomeApi.js';
import { setupStatus } from '@features/setup/setupStatus.js';
import { isOnline } from '@shared/hooks/useNetwork.js';
import { ROUTES } from '@app/router/routes.js';

// Longest a launch waits to learn whether income is set. After this it lands on Home and SetupGuard takes over.
const INCOME_WAIT_MS = 3000;
// The setup screens. A person already on one of these is not sent back to the first.
const SETUP_ROUTES = [ROUTES.setupIncome, ROUTES.setupObligations, ROUTES.setupLock, ROUTES.setPin];

const tooSlow = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('Too slow')), ms));

// true: income is set. false: it is not. null: could not tell (no connection, slow, failed).
// Reading it also fills the income query, so SetupGuard finds it fresh and does not ask again.
// fetch false (a return to the foreground) reads only what is already cached, so resuming costs no request.
async function isIncomeSet({ fetch }) {
  const key = queryKeys.income.current();
  if (!fetch) {
    const cached = queryClient.getQueryData(key);
    return cached === undefined ? null : cached !== null;
  }
  if (!isOnline()) return null;
  try {
    const income = await Promise.race([queryClient.fetchQuery({ queryKey: key, queryFn: incomeApi.get }), tooSlow(INCOME_WAIT_MS)]);
    return income !== null;
  } catch {
    return null;
  }
}

// The one routing decision (Plan 5e). Every launch and every return to the foreground asks the same questions, in
// this order: installed? signed in? locked? setup done? Resolves to the path the person must be on, or null when
// they may stay where they are.
//   launching  true on a cold start: when nothing is in the way, the answer is Home.
//              false on a return to the foreground: when nothing is in the way, the answer is null (stay).
//   pathname   where the person is now. Only used on a return, so it never pulls anyone off the screen they are on.
// Not signed in is only acted on at launch: later, AuthGuard moves people off screens that need a session.
export async function decideRoute({ launching, pathname = '' }) {
  const installed = env.skipInstallGuard || isPWAInstalled();
  if (!installed) return null; // a browser tab: Onboarding and Install are the right screens

  if (!sessionManager.hasSession()) return launching ? ROUTES.welcome : null;

  if (launching) await pinService.sync(); // follow a PIN set or removed on another device

  if (lockState.isLocked()) return pathname === ROUTES.unlock ? null : ROUTES.unlock;

  // Signed in again after "Forgot PIN?": the next step is choosing a new PIN.
  if (pinService.resetPending() && pinStore.has()) return pathname === ROUTES.setPin ? null : ROUTES.setPin;

  const incomeSet = await isIncomeSet({ fetch: launching });
  if (incomeSet === false) return SETUP_ROUTES.includes(pathname) ? null : ROUTES.setupIncome;

  // Income is set but setup was never finished on this device (closed part-way, or a new device): resume it.
  if (incomeSet === true && !setupStatus.isComplete()) return SETUP_ROUTES.includes(pathname) ? null : ROUTES.setupObligations;

  return launching ? ROUTES.home : null;
}
