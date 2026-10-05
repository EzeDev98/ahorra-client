import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { FROM_SETUP } from '@features/setup/setupSteps.js';
import useFinishSetup from '@features/setup/useFinishSetup.js';
import FormScreen from '@shared/components/layout/FormScreen.jsx';
import Button from '@shared/components/ui/Button.jsx';
import LoadingScreen from '@shared/components/feedback/LoadingScreen.jsx';
import { LOCK_OFFER } from './lockContent.js';
import { pinService } from './pinService.js';

// Route "/setup/lock". The last stop of first-run setup: a one-time, skippable offer to lock the app with a PIN.
// It is not a step in the indicator. Set PIN opens the Set PIN screen (Step 8c) in its setup mode; Skip for now
// finishes setup and goes straight to the app, replacing this screen in the history so Back never returns here.
// backTo: fixed obligations. setPinTo: Set PIN. homeTo: where setup ends.
// Passed in so this file holds no path.
export default function LockOffer({ backTo, setPinTo, homeTo }) {
  const navigate = useNavigate();
  const finish = useFinishSetup(homeTo);
  const [checked, setChecked] = useState(false);

  // A PIN already on the server means the lock was set up before (an earlier install or device): there is nothing to
  // offer, so setup ends here. If the server cannot be reached, the offer is shown.
  useEffect(() => {
    let cancelled = false;
    pinService.hasServerPin().then((has) => {
      if (cancelled) return;
      if (has) finish();
      else setChecked(true);
    });
    return () => {
      cancelled = true;
    };
  }, [finish]);

  if (!checked) return <LoadingScreen page />;

  return (
    <FormScreen
      title={LOCK_OFFER.title}
      description={LOCK_OFFER.description}
      onBack={() => navigate(backTo)}
      footer={
        <>
          <Button block onClick={() => navigate(setPinTo, { state: FROM_SETUP })}>
            Set PIN
          </Button>
          <Button variant="ghost" block onClick={finish}>
            Skip for now
          </Button>
        </>
      }
    />
  );
}
