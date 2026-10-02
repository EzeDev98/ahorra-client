import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useToast } from '@shared/components/ui/toastContext.js';
import PinFlow from './PinFlow.jsx';
import { PIN_FLOW } from './lockContent.js';
import { pinStore } from './pinStore.js';

// Route "/settings/security/change-pin". The current PIN first, then a new one, then confirm. Without a PIN there is
// nothing to change, so the person is sent to Set PIN.
// securityTo: Settings, Security. setPinTo: Set PIN. Passed in so this file holds no path.
export default function ChangePin({ securityTo, setPinTo }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [hasPin] = useState(pinStore.has); // checked once: it must not redirect after the new PIN is saved

  if (!hasPin) return <Navigate to={setPinTo} replace />;

  const done = () => {
    toast.show(PIN_FLOW.change.done, { tone: 'success' });
    navigate(securityTo, { replace: true });
  };

  return <PinFlow mode="change" onBack={() => navigate(securityTo)} onDone={done} />;
}
