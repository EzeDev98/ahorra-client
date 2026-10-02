import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import useFinishSetup from '@features/setup/useFinishSetup.js';
import { useToast } from '@shared/components/ui/toastContext.js';
import PinFlow from './PinFlow.jsx';
import { PIN_FLOW } from './lockContent.js';
import { pinStore } from './pinStore.js';

// Route "/set-pin". Turns app lock on by choosing a PIN. Reached from the lock offer in setup (router state
// fromSetup: it has "Skip for now", and finishing ends setup) and from Settings, Security (it returns there).
// If a PIN already exists, replacing it without asking for the old one would defeat it: from Settings the person is sent to
// Change PIN, and from setup the lock is already on, so setup simply finishes.
// offerTo: the setup lock offer. securityTo: Settings, Security. changePinTo: Change PIN. homeTo: where setup ends.
// Passed in so this file holds no path.
export default function SetPin({ offerTo, securityTo, changePinTo, homeTo }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const toast = useToast();
  const finish = useFinishSetup(homeTo);
  const [hasPin] = useState(pinStore.has); // checked once: setting the PIN must not redirect this screen
  const fromSetup = Boolean(state?.fromSetup);

  useEffect(() => {
    if (hasPin && fromSetup) finish();
  }, [hasPin, fromSetup, finish]);

  if (hasPin) return fromSetup ? null : <Navigate to={changePinTo} replace />;

  const done = () => {
    toast.show(PIN_FLOW.set.done, { tone: 'success' });
    if (fromSetup) finish();
    else navigate(securityTo, { replace: true });
  };

  return (
    <PinFlow
      mode="set"
      onBack={() => navigate(fromSetup ? offerTo : securityTo)}
      onDone={done}
      onSkip={fromSetup ? finish : undefined}
    />
  );
}
