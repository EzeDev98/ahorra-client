import { useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router';
import './SettingsAccount.css';
import { sessionManager } from '@features/auth/session/sessionManager.js';
import PageHeader from '@shared/components/layout/PageHeader.jsx';
import ScreenContainer from '@shared/components/layout/ScreenContainer.jsx';
import Button from '@shared/components/ui/Button.jsx';
import Card from '@shared/components/ui/Card.jsx';
import DetailRow from '@shared/components/ui/DetailRow.jsx';
import { ACCOUNT_COPY } from './accountContent.js';
import { accountProfile } from './accountProfile.js';

// Route "/settings/account" (Step 11c). Read-only: who is signed in, from what sign-in returned (there is no profile
// endpoint), and Sign out. A detail the token does not carry is left out. Inner screen: top-aligned under PageHeader (Guide 4.8).
// Signing out ends the session on this device at once; AuthGuard then leaves the screen for Welcome.
// backTo: Settings. Passed in so this file holds no path.
export default function SettingsAccount({ backTo }) {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);
  const token = useSyncExternalStore(sessionManager.subscribe, sessionManager.getAccessToken);
  const profile = accountProfile(token, sessionManager.getUser()?.username);

  const rows = [
    [ACCOUNT_COPY.username, profile.username],
    [ACCOUNT_COPY.email, profile.email],
    [ACCOUNT_COPY.phone, profile.phone],
  ].filter(([, value]) => value);

  const signOut = () => {
    if (leaving) return;
    setLeaving(true);
    sessionManager.signOut();
  };

  return (
    <ScreenContainer>
      <PageHeader title={ACCOUNT_COPY.title} onBack={() => navigate(backTo)} />
      <div className="settings-account">
        <Card>
          {rows.map(([label, value]) => (
            <DetailRow key={label} label={label}>
              {value}
            </DetailRow>
          ))}
        </Card>
        <p className="settings-account__note">{ACCOUNT_COPY.note}</p>
        <Button variant="secondary" busy={leaving} onClick={signOut}>
          {ACCOUNT_COPY.signOut}
        </Button>
      </div>
    </ScreenContainer>
  );
}
