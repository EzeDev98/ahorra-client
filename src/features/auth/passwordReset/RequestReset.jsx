import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { ApiError } from '@core/http/httpClient.js';
import { authApi } from '@features/auth/api/authApi.js';
import FormScreen from '@shared/components/layout/FormScreen.jsx';
import Button from '@shared/components/ui/Button.jsx';
import FormError from '@shared/components/ui/FormError.jsx';
import FormField from '@shared/components/ui/FormField.jsx';
import TextField from '@shared/components/ui/TextField.jsx';
import { RESEND_COOLDOWN_MS, passwordResetFlow } from './passwordResetFlow.js';
import { GENERIC_ERROR, HINTS, LABELS, REQUEST } from './resetContent.js';
import { cleanPhone, validatePhone } from './resetRules.js';

// Route "/forgot-password". Step 1 of 3: the phone number on the account. The server texts a code.
// backTo: Login. verifyCodeTo: the code screen. Passed in so this file holds no path.
export default function RequestReset({ backTo, verifyCodeTo }) {
  const navigate = useNavigate();
  const [phone, setPhone] = useState(() => passwordResetFlow.get()?.phoneNumber ?? '');
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);
  const input = useRef(null);

  const change = (event) => {
    setPhone(event.target.value);
    setError(null);
    setFormError(null);
  };

  const submit = async () => {
    if (busy) return;
    const problem = validatePhone(phone);
    if (problem) {
      setError(problem);
      input.current?.focus();
      return;
    }

    const phoneNumber = cleanPhone(phone.trim());

    // Back from the code screen, same number, cooldown still running: the code already sent is still the one to use.
    // Asking again now would only earn a 429.
    const current = passwordResetFlow.get();
    if (
      current?.phoneNumber === phoneNumber &&
      current.resendAvailableAt > Date.now() &&
      !passwordResetFlow.getResetToken()
    ) {
      navigate(verifyCodeTo);
      return;
    }

    setError(null);
    setFormError(null);
    setBusy(true);
    try {
      await authApi.requestPasswordReset({ phoneNumber });
      passwordResetFlow.begin({ phoneNumber, resendAvailableAt: Date.now() + RESEND_COOLDOWN_MS });
      navigate(verifyCodeTo);
    } catch (caught) {
      setFormError(caught instanceof ApiError ? caught.message : GENERIC_ERROR);
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormScreen
      title={REQUEST.title}
      description={REQUEST.description}
      onBack={() => navigate(backTo)}
      onSubmit={submit}
      footer={
        <>
          <FormError>{formError}</FormError>
          <Button type="submit" block busy={busy}>
            Send code
          </Button>
        </>
      }
    >
      <FormField label={LABELS.phoneNumber} hint={HINTS.phoneNumber} error={error}>
        <TextField
          inputRef={input}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={change}
        />
      </FormField>
    </FormScreen>
  );
}
