import { useNavigate } from 'react-router';
import './SettingsReminder.css';
import PageHeader from '@shared/components/layout/PageHeader.jsx';
import ScreenContainer from '@shared/components/layout/ScreenContainer.jsx';
import Checkbox from '@shared/components/ui/Checkbox.jsx';
import InfoBanner from '@shared/components/ui/InfoBanner.jsx';
import { REMINDER_COPY } from './reminderContent.js';
import useReminder from './useReminder.js';

// Route "/settings/reminder" (Steps 12a, 12b). The one daily nudge (Guide 8.3): a checkbox, with the reason beside it. The
// permission question appears only when the person ticks the box, never at launch. When push cannot work here, or
// notifications are blocked, the box is off and a banner says why. Inner screen: top-aligned under PageHeader (Guide 4.8).
// backTo: Settings. Passed in so this file holds no path.
export default function SettingsReminder({ backTo }) {
  const navigate = useNavigate();
  const { status, busy, failed, turnOn, turnOff } = useReminder();
  const unavailable = status === 'needs-install' || status === 'unsupported' || status === 'blocked';
  const reason = { 'needs-install': REMINDER_COPY.needsInstall, unsupported: REMINDER_COPY.unsupported, blocked: REMINDER_COPY.blocked }[status];

  return (
    <ScreenContainer>
      <PageHeader title={REMINDER_COPY.title} onBack={() => navigate(backTo)} />
      <div className="settings-reminder">
        <Checkbox
          label={REMINDER_COPY.label}
          hint={REMINDER_COPY.hint}
          checked={status === 'on'}
          disabled={unavailable || busy}
          onChange={(event) => (event.target.checked ? turnOn() : turnOff())}
        />
        {reason && <InfoBanner tone="warning">{reason}</InfoBanner>}
        {failed && <InfoBanner tone="error">{REMINDER_COPY.failed}</InfoBanner>}
      </div>
    </ScreenContainer>
  );
}
