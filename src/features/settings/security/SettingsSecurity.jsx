import { useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router';
import './SettingsSecurity.css';
import { pinStore } from '@features/lock/pinStore.js';
import PageHeader from '@shared/components/layout/PageHeader.jsx';
import ScreenContainer from '@shared/components/layout/ScreenContainer.jsx';
import Button from '@shared/components/ui/Button.jsx';
import Checkbox from '@shared/components/ui/Checkbox.jsx';
import { CHANGE_PIN, LOCK, TITLE } from './securityContent.js';

// Route "/settings/security". The app lock checkbox and Change PIN. The checkbox shows whether a PIN is stored
// (pinStore.has) and never flips by itself: ticking it goes to Set PIN, unticking it goes to the screen that asks for
// the current PIN. Both come back here, and the box follows the stored PIN.
// backTo: Settings. setPinTo, lockOffTo, changePinTo: the PIN screens. Passed in so this file holds no path.
export default function SettingsSecurity({ backTo, setPinTo, lockOffTo, changePinTo }) {
  const navigate = useNavigate();
  const lockOn = useSyncExternalStore(pinStore.subscribe, pinStore.has);
  const supported = pinStore.isSupported();

  return (
    <ScreenContainer>
      <PageHeader title={TITLE} onBack={() => navigate(backTo)} />
      <div className="settings-security">
        <Checkbox
          label={LOCK.label}
          hint={supported ? LOCK.hint : LOCK.unsupported}
          checked={lockOn}
          disabled={!supported}
          onChange={(event) => navigate(event.target.checked ? setPinTo : lockOffTo)}
        />
        {lockOn && (
          <Button variant="secondary" onClick={() => navigate(changePinTo)}>
            {CHANGE_PIN}
          </Button>
        )}
      </div>
    </ScreenContainer>
  );
}
