import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { ApiError } from '@core/http/httpClient.js';
import { run } from '@core/motion/motion.js';
import { authApi } from '@features/auth/api/authApi.js';
import { RESEND_COOLDOWN_MS, pendingVerification } from '@features/auth/verification/pendingVerification.js';
import AccountStep from './AccountStep.jsx';
import PersonalStep from './PersonalStep.jsx';
import { GENERIC_ERROR } from './registerContent.js';
import { INITIAL_VALUES, cleanPhone, toRequestBody, validateAccount, validatePersonal } from './registerRules.js';

// How far the form slides when the step changes, in pixels. Same as the screen transitions; reduced motion keeps a fade.
const SLIDE_PX = 16;

// The server's 409 messages name what is already taken. Show each one under the field it is about.
function conflictField(message) {
  const text = message.toLowerCase();
  if (text.includes('phone')) return 'phoneNumber';
  if (text.includes('email')) return 'email';
  if (text.includes('username')) return 'username';
  return null;
}

// Route "/register". Two steps on one route: personal details, then the account. Going back to step 1 keeps what
// was typed. On success the phone number is kept for the verify screen and Register is replaced in the history,
// because the account now exists.
// backTo: Welcome. verifyPhoneTo: the verify-phone screen. Passed in so this file holds no path.
export default function Register({ backTo, verifyPhoneTo }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [focusTick, setFocusTick] = useState(0);

  const stage = useRef(null);
  const previousStep = useRef(step);

  // The new step arrives with a short slide and fade, before it is first painted.
  useLayoutEffect(() => {
    if (previousStep.current === step) return;
    const direction = step > previousStep.current ? 1 : -1;
    previousStep.current = step;
    window.scrollTo({ top: 0 });
    run(stage.current, [{ opacity: 0, transform: `translateX(${direction * SLIDE_PX}px)` }, { opacity: 1, transform: 'none' }]);
  }, [step]);

  // After a failed attempt, move focus to the first field that is wrong.
  useEffect(() => {
    if (focusTick) stage.current?.querySelector('[aria-invalid="true"]')?.focus();
  }, [focusTick]);

  const showErrors = (found) => {
    setErrors(found);
    setFocusTick((tick) => tick + 1);
  };

  // Returns the change handler for one field. Typing in a field clears that field's error.
  const onChange = (name) => (event) => {
    const { value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
  };

  const submitPersonal = () => {
    const found = validatePersonal(values);
    if (Object.keys(found).length) {
      showErrors(found);
      return;
    }
    setErrors({});
    setStep(2);
  };

  const submitAccount = async () => {
    if (busy) return;
    const found = validateAccount(values);
    if (Object.keys(found).length) {
      showErrors(found);
      return;
    }

    setErrors({});
    setFormError(null);
    setBusy(true);
    try {
      await authApi.register(toRequestBody(values));
      pendingVerification.set({
        phoneNumber: cleanPhone(values.phoneNumber.trim()),
        username: values.username.trim(),
        resendAvailableAt: Date.now() + RESEND_COOLDOWN_MS, // the code has just been sent
      });
      navigate(verifyPhoneTo, { replace: true });
    } catch (error) {
      const field = error instanceof ApiError && error.isConflict ? conflictField(error.message) : null;
      if (field) showErrors({ [field]: error.message });
      else setFormError(error instanceof ApiError ? error.message : GENERIC_ERROR);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div ref={stage}>
      {step === 1 ? (
        <PersonalStep
          values={values}
          errors={errors}
          onChange={onChange}
          onSubmit={submitPersonal}
          onBack={() => navigate(backTo)}
        />
      ) : (
        <AccountStep
          values={values}
          errors={errors}
          formError={formError}
          busy={busy}
          onChange={onChange}
          onSubmit={submitAccount}
          onBack={() => setStep(1)}
        />
      )}
    </div>
  );
}
