import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { run } from '@core/motion/motion.js';
import { sessionManager } from '@features/auth/session/sessionManager.js';
import FormScreen from '@shared/components/layout/FormScreen.jsx';
import Button from '@shared/components/ui/Button.jsx';
import FormField from '@shared/components/ui/FormField.jsx';
import OtpField from '@shared/components/ui/OtpField.jsx';
import useCountdown from '@shared/hooks/useCountdown.js';
import './Unlock.css';
import { UNLOCK } from './lockContent.js';
import { lockState } from './lockState.js';
import { PIN_LENGTH, pinStore } from './pinStore.js';
import { SHAKE } from './pinMotion.js';

// Why the session ended, for Login to read (sessionManager.getEndedReason). Matches the key in loginContent.js.
const FORGOT_PIN = 'forgotPin';

// Route "/unlock". Asks for the PIN while the app is locked. A right PIN unlocks the app and returns the person to
// where they were (the path UnlockGuard remembered in state.from), or to Home when there is none (a cold start).
// The wrong-PIN policy lives in pinStore.verify (5 wrong PINs, then a wait that doubles); this screen shows it.
// There is no Back: nothing else is reachable while locked. "Forgot PIN? Sign in again" (8e) removes the PIN and signs out.
// homeTo: where to go when there is nowhere to return to. Passed in so this file holds no path.
export default function Unlock({ homeTo }) {
  const navigate = useNavigate();
  const { pathname, state } = useLocation();
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(() => pinStore.getAttempts().lockedUntil);
  const [focusTick, setFocusTick] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const seconds = useCountdown(lockedUntil);
  const boxes = useRef(null);
  const waiting = seconds > 0;

  // Unlock, then go back to where the person was. Only an address inside the app is trusted as a place to return to.
  const goOn = useCallback(() => {
    lockState.unlock();
    const from = state?.from;
    const inside = typeof from === 'string' && from.startsWith('/') && !from.startsWith('//');
    const back = inside && from.split(/[?#]/)[0] !== pathname;
    navigate(back ? from : homeTo, { replace: true });
  }, [navigate, state, pathname, homeTo]);

  // No PIN is stored (it was turned off in another tab): nothing to ask for.
  useEffect(() => {
    if (!pinStore.has()) goOn();
  }, [goOn]);

  // Put the cursor back in the first box after a failed attempt, and when a wait ends.
  useEffect(() => {
    if (!waiting) boxes.current?.querySelector('input')?.focus();
  }, [focusTick, waiting]);

  const verify = async (pin) => {
    if (verifying || waiting) return;
    if (!pinStore.isSupported()) {
      setError(UNLOCK.unsupported);
      setCode('');
      setFocusTick((tick) => tick + 1);
      return;
    }

    setError(null);
    setVerifying(true);
    try {
      const result = await pinStore.verify(pin);
      if (result.ok) {
        goOn();
        return; // stays busy while the screen leaves
      }
      setLockedUntil(result.lockedUntil);
      setError(result.lockedUntil ? null : UNLOCK.wrong(result.attemptsLeft));
      run(boxes.current, SHAKE, { duration: 'base', ease: 'standard' });
    } catch {
      setError(UNLOCK.generic);
    }
    setCode('');
    setVerifying(false);
    setFocusTick((tick) => tick + 1);
  };

  const change = (next) => {
    setCode(next);
    if (error) setError(null);
  };

  // "Forgot PIN? Sign in again" (Step 8e). There is no reset: the PIN only guards this screen, not any data. The PIN is
  // removed first (it is stored under the signed-in person), then the session ends with a reason, which makes AuthGuard
  // land on Login (and Login say the lock is off). Signing out also unlocks the app (autoLock.js).
  const forgot = () => {
    if (leaving) return;
    setLeaving(true);
    pinStore.remove();
    sessionManager.signOut(FORGOT_PIN);
  };

  // While a wait runs the message stays still (a screen reader announces it once); the countdown is separate text.
  const message = waiting ? UNLOCK.lockedOut : error;

  return (
    <FormScreen
      className="ui-form-screen--code"
      title={UNLOCK.title}
      description={UNLOCK.description(PIN_LENGTH)}
      footer={
        <>
          {waiting && <p className="unlock__wait">{UNLOCK.wait(seconds)}</p>}
          <Button variant="ghost" block busy={leaving} onClick={forgot}>
            {UNLOCK.forgot}
          </Button>
        </>
      }
    >
      <FormField label={UNLOCK.label} error={message}>
        <div ref={boxes}>
          <OtpField
            value={code}
            onChange={change}
            onComplete={verify}
            length={PIN_LENGTH}
            disabled={verifying || waiting}
            masked
            autoFocus
          />
        </div>
      </FormField>
    </FormScreen>
  );
}
