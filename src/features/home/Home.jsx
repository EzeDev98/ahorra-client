import { useEffect, useMemo, useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import './Home.css';
import Badge from '@shared/components/ui/Badge.jsx';
import IconButton from '@shared/components/ui/IconButton.jsx';
import Composer from './Composer.jsx';
import Greeting from './Greeting.jsx';
import { gateNote } from './gate.js';
import { BELL_LABEL } from './pendingContent.js';
import { parkedEntries, useParked } from './parkedEntries.js';
import PendingStack from './PendingStack.jsx';
import ReminderNudge from './ReminderNudge.jsx';
import SidePanel from './SidePanel.jsx';
import useBellPeek from './useBellPeek.js';
import useGreeting from './useGreeting.js';
import useDayStatus from './useDayStatus.js';
import useGateWatch from './useGateWatch.js';

// Route "/home". The core screen (Guide 7). It does not use ScreenContainer: the input line sits at the vertical centre
// of the stage, the greeting is anchored above it and the cards below it, so nothing that appears later can move the input.
// Built in steps: 9a this skeleton, 9b the greeting words, 9c the composer, 9e to 9l the cards, the bell and the gate,
// 9m the side panel.
export default function Home({ destinations }) {
  const { title, subtitle } = useGreeting();
  const { status, loadFailed, retrying, retry } = useDayStatus();
  const parked = useParked();
  const peek = useBellPeek();
  const [menuOpen, setMenuOpen] = useState(false);
  const gated = Boolean(status?.gated);
  const note = gateNote(status);
  useGateWatch(status);

  // While Home is on screen, an app open sends parked entries back out with the fly-out animation (Step 9k).
  useEffect(() => parkedEntries.attach(), []);

  // The server forces gated entries back onto Home (Guide 7.7): anything in the bell flies back out, and stays out.
  useEffect(() => {
    if (gated) parkedEntries.releaseAll();
  }, [gated]);

  const pending = status?.pending;
  // What the stack shows: everything pending except what has been sent to the bell.
  const visible = useMemo(() => pending?.filter((entry) => !parked.parked.has(String(entry.id))), [pending, parked.parked]);
  // What the bell holds. Counted against the pending list, so an entry confirmed elsewhere stops counting.
  const waiting = pending ? pending.filter((entry) => parked.inBell.has(String(entry.id))).length : 0;

  // Tapping the bell sends everything waiting back out to its place; with nothing waiting it says so for a moment (Guide 7.5).
  const openBell = () => {
    if (parkedEntries.release().length === 0) peek.show();
  };

  return (
    <div className="home">
      <header className="home__bar">
        <IconButton icon={Menu} label="Open menu" aria-haspopup="dialog" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)} />
        <div className="home__bell">
          <IconButton icon={Bell} label={waiting ? BELL_LABEL.waiting(waiting) : BELL_LABEL.empty} data-bell onClick={openBell}>
            <Badge count={waiting} floating />
          </IconButton>
          <div className="home__peek" role="status" data-visible={peek.visible}>
            {peek.mounted ? BELL_LABEL.empty : null}
          </div>
        </div>
      </header>
      <main className="home__stage">
        <Greeting title={title} subtitle={subtitle} />
        <Composer gated={gated} />
        <PendingStack entries={visible} gated={gated} note={note} loadFailed={loadFailed} retrying={retrying} onRetry={retry} />
        <ReminderNudge to={destinations.reminder} />
      </main>
      <SidePanel open={menuOpen} gated={gated} destinations={destinations} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
