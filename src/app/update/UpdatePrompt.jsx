import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router';
import Modal from '@shared/components/ui/Modal.jsx';
import Button from '@shared/components/ui/Button.jsx';
import { appUpdate, CHECK_EVERY_MS, useAppUpdate } from '@core/pwa/appUpdate.js';
import { sessionManager } from '@features/auth/session/sessionManager.js';
import useDayStatus from '@features/home/useDayStatus.js';
import { ROUTES } from '@app/router/routes.js';

// The dialog itself. `waiting` is how many entries still need an answer (null while that is being checked).
function UpdateDialog({ waiting, onLater, onReview }) {
  const [busy, setBusy] = useState(false);
  const blocked = waiting === null || waiting > 0;

  const install = async () => {
    setBusy(true);
    await appUpdate.install();
  };

  let message = 'A new version of Ahorra is ready. Updating takes a few seconds and keeps you signed in.';
  if (waiting === null) message = 'Checking your entries before updating…';
  else if (waiting > 0) {
    message = `You have ${waiting} ${waiting === 1 ? 'entry' : 'entries'} waiting. Please confirm or discard ${
      waiting === 1 ? 'it' : 'all of them'
    } before updating, so nothing is lost.`;
  }

  return (
    <Modal
      open
      onClose={onLater}
      title="Update available"
      footer={
        <>
          <Button variant="ghost" onClick={onLater}>
            Later
          </Button>
          {waiting > 0 ? (
            <Button onClick={onReview}>Go to my entries</Button>
          ) : (
            <Button busy={busy} disabled={blocked} onClick={install}>
              Update now
            </Button>
          )}
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}

// Signed in: counts the entries still waiting (today's, plus any other days behind a gate) every time it opens.
function SignedInDialog({ onLater }) {
  const navigate = useNavigate();
  const { status } = useDayStatus();
  const waiting = status ? (status.pending?.length ?? 0) + (status.otherDaysRemaining ?? 0) : null;
  return (
    <UpdateDialog
      waiting={waiting}
      onLater={onLater}
      onReview={() => {
        onLater();
        navigate(ROUTES.home);
      }}
    />
  );
}

// Appears as soon as a newer build is found, and comes back every 3 minutes until the person updates.
export default function UpdatePrompt() {
  const { latest } = useAppUpdate();
  const signedIn = useSyncExternalStore(sessionManager.subscribe, sessionManager.hasSession);
  const [open, setOpen] = useState(false);
  const shownBefore = useRef(false);

  useEffect(() => {
    if (!latest || open) return undefined;
    const timer = setTimeout(() => setOpen(true), shownBefore.current ? CHECK_EVERY_MS : 0);
    return () => clearTimeout(timer);
  }, [latest, open]);

  if (!latest || !open) return null;
  const later = () => {
    shownBefore.current = true;
    setOpen(false);
  };
  return signedIn ? <SignedInDialog onLater={later} /> : <UpdateDialog waiting={0} onLater={later} onReview={later} />;
}
