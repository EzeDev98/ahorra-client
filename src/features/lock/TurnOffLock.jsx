import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useToast } from '@shared/components/ui/toastContext.js';
import PinFlow from './PinFlow.jsx';
import { PIN_FLOW } from './lockContent.js';
import { pinStore } from './pinStore.js';

// Route "/settings/security/lock-off". Turning app lock off asks for the current PIN first, so nobody who picks up an
// unlocked phone can switch the lock off. The PIN is checked by PinFlow (pinStore.verify, so the wrong-PIN policy and
// wait apply), then removed here. Without a PIN there is nothing to turn off, so the person is sent back.
// securityTo: Settings, Security. Passed in so this file holds no path.
export default function TurnOffLock({ securityTo }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [hasPin] = useState(pinStore.has); // checked once: removing the PIN must not redirect before we leave

  if (!hasPin) return <Navigate to={securityTo} replace />;

  const done = () => {
    pinStore.remove();
    toast.show(PIN_FLOW.off.done, { tone: 'success' });
    navigate(securityTo, { replace: true });
  };

  return <PinFlow mode="off" onBack={() => navigate(securityTo)} onDone={done} />;
}
