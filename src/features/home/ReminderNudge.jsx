import { X } from 'lucide-react';
import IconButton from '@shared/components/ui/IconButton.jsx';
import TextLink from '@shared/components/ui/TextLink.jsx';
import { reminderStore } from '@features/notifications/reminderStore.js';
import { NUDGE_COPY } from './reminderNudgeContent.js';
import { reminderNudge, useReminderNudgeArmed } from './reminderNudge.js';

// Only where the reminder can actually be switched on from Settings: the browser can push, the permission is not
// blocked and the reminder is off. On iPhone outside the installed app there is no push, so the line stays away.
function canOfferReminder() {
  if (typeof window === 'undefined' || !('Notification' in window) || !('PushManager' in window)) return false;
  if (!('serviceWorker' in navigator)) return false;
  return Notification.permission !== 'denied' && !reminderStore.isOn();
}

// One quiet line at the foot of the stage, after the first confirmed entry (Step 16c). It takes no space from the
// cards: the cards already leave room under them. Following it or dismissing it ends it for good on this device.
export default function ReminderNudge({ to }) {
  const armed = useReminderNudgeArmed();
  if (!armed || !to || !canOfferReminder()) return null;

  return (
    <div className="home__nudge">
      <p className="home__nudge-text">
        {NUDGE_COPY.text}{' '}
        <TextLink to={to} onClick={reminderNudge.dismiss}>
          {NUDGE_COPY.action}
        </TextLink>
      </p>
      <IconButton icon={X} label={NUDGE_COPY.dismiss} onClick={reminderNudge.dismiss} />
    </div>
  );
}
