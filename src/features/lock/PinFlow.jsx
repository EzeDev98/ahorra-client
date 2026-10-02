import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { run } from '@core/motion/motion.js';
import FormScreen from '@shared/components/layout/FormScreen.jsx';
import Button from '@shared/components/ui/Button.jsx';
import FormField from '@shared/components/ui/FormField.jsx';
import OtpField from '@shared/components/ui/OtpField.jsx';
import useCountdown from '@shared/hooks/useCountdown.js';
import './PinFlow.css';
import { PIN_FLOW, UNLOCK } from './lockContent.js';
import { SHAKE } from './pinMotion.js';
import { PIN_LENGTH, pinStore } from './pinStore.js';

// How far a step slides in, in pixels. Same as the other screens; reduced motion keeps a fade.
const SLIDE_PX = 16;

// Set: create, then confirm. Change: the current PIN first, then create, then confirm. Off: the current PIN only.
const STEPS = { set: ['new', 'confirm'], change: ['current', 'new', 'confirm'], off: ['current'] };

const text = (value) => (typeof value === 'function' ? value(PIN_LENGTH) : value);

// The shared engine behind Set PIN and Change PIN. One screen whose content changes step by step.
//   mode    'set' | 'change' | 'off'
//   onBack  Back on the first step leaves the flow (Back on "confirm" returns to "create")
//   onDone  called once the new PIN has been saved
//   onSkip  optional: shows "Skip for now" (the setup offer only)
// The new PIN is held in memory only while it is being confirmed, and is stored (hashed) only when both entries match.
// The current-PIN step uses pinStore.verify, so the wrong-PIN policy and wait apply as they do on Unlock.
export default function PinFlow({ mode, onBack, onDone, onSkip }) {
  const copy = PIN_FLOW[mode];
  const steps = STEPS[mode];
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(() => pinStore.getAttempts().lockedUntil);
  const [focusTick, setFocusTick] = useState(0);
  const seconds = useCountdown(lockedUntil);
  const pending = useRef(''); // the new PIN, while it is being confirmed
  const direction = useRef(0); // 1 forward, -1 back, 0 first render: which way the next step slides in
  const stage = useRef(null);
  const boxes = useRef(null);
  const waiting = step === 'current' && seconds > 0;

  // A new step slides in (not on the first render).
  useLayoutEffect(() => {
    if (!direction.current) return;
    const from = direction.current * SLIDE_PX;
    direction.current = 0;
    run(stage.current, [{ opacity: 0, transform: `translateX(${from}px)` }, { opacity: 1, transform: 'none' }], {
      duration: 'base',
      ease: 'out',
    });
  }, [index]);

  // Put the cursor in the first box when a step starts, after a failed attempt, and when a wait ends.
  useEffect(() => {
    if (!waiting) boxes.current?.querySelector('input')?.focus();
  }, [focusTick, waiting]);

  const go = (nextIndex) => {
    direction.current = nextIndex > index ? 1 : -1;
    setIndex(nextIndex);
    setCode('');
    setError(null);
    setBusy(false);
    setFocusTick((tick) => tick + 1);
  };

  const fail = (message) => {
    setError(message);
    setCode('');
    setBusy(false);
    setFocusTick((tick) => tick + 1);
    run(boxes.current, SHAKE, { duration: 'base', ease: 'standard' });
  };

  const change = (next) => {
    setCode(next);
    if (error) setError(null);
  };

  const submit = async (pin) => {
    if (busy || waiting) return;
    setError(null);

    if (step === 'current') {
      setBusy(true);
      try {
        const result = await pinStore.verify(pin);
        if (result.ok) {
          if (index === steps.length - 1) onDone(); // the only step (turning the lock off); stays busy while the screen leaves
          else go(index + 1);
          return;
        }
        setLockedUntil(result.lockedUntil);
        fail(result.lockedUntil ? null : UNLOCK.wrong(result.attemptsLeft));
      } catch {
        fail(UNLOCK.generic);
      }
      return;
    }

    if (step === 'new') {
      pending.current = pin;
      go(index + 1);
      return;
    }

    // confirm
    if (pin !== pending.current) {
      fail(PIN_FLOW.mismatch);
      return;
    }
    setBusy(true);
    try {
      await pinStore.set(pin);
      pending.current = '';
      onDone(); // stays busy while the screen leaves
    } catch (caught) {
      fail(caught instanceof Error ? caught.message : UNLOCK.generic);
    }
  };

  const back = () => {
    if (step === 'confirm') {
      pending.current = '';
      go(index - 1);
      return;
    }
    onBack();
  };

  if (!pinStore.isSupported()) {
    return (
      <FormScreen title={PIN_FLOW.unsupported.title} description={PIN_FLOW.unsupported.description} onBack={onBack} />
    );
  }

  // While a wait runs the message stays still (a screen reader announces it once); the countdown is separate text.
  const message = waiting ? UNLOCK.lockedOut : error;
  const footer =
    waiting || onSkip ? (
      <>
        {waiting && <p className="pin-flow__wait">{UNLOCK.wait(seconds)}</p>}
        {onSkip && (
          <Button variant="ghost" block onClick={onSkip}>
            {PIN_FLOW.skip}
          </Button>
        )}
      </>
    ) : undefined;

  return (
    <div ref={stage}>
      <FormScreen title={copy[step].title} description={text(copy[step].description)} onBack={back} footer={footer}>
        <FormField label={PIN_FLOW.label} error={message}>
          <div ref={boxes}>
            <OtpField value={code} onChange={change} onComplete={submit} length={PIN_LENGTH} disabled={busy || waiting} masked />
          </div>
        </FormField>
      </FormScreen>
    </div>
  );
}
