import { useState } from 'react';
import { useNavigate } from 'react-router';
import './SidePanel.css';
import { sessionManager } from '@features/auth/session/sessionManager.js';
import Verdict from '@shared/components/feedback/Verdict.jsx';
import Button from '@shared/components/ui/Button.jsx';
import Drawer from '@shared/components/ui/Drawer.jsx';
import Spinner from '@shared/components/ui/Spinner.jsx';
import Tag from '@shared/components/ui/Tag.jsx';
import { formatMoney } from '@shared/utils/formatMoney.js';
import { NAV_ITEMS, PANEL_COPY } from './sidePanelContent.js';
import { todayVerdict } from './todayVerdict.js';
import useAmbient from './useAmbient.js';

// The side panel (Guide 7.2, Step 9m). It slides over Home without a route change, so the input stays mounted. Closing is
// by the scrim, the close button or Escape, and focus goes in and comes back to the menu button (Drawer does all of this).
// Today: the total with a quiet verdict line and an "N unconfirmed" tag, from GET /report/ambient. While the day is gated
// the server refuses those figures, so the panel says so instead of asking. Then the four destinations and Sign out.
// open, onClose: Home owns the state. gated: the day gate from GET /day/status.
// destinations: { reports, insights, behavior, settings } paths, passed in so this file holds no path.
export default function SidePanel({ open, gated, destinations, onClose }) {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);
  const { ambient, failed, retry } = useAmbient({ enabled: open && !gated });
  const line = todayVerdict(ambient);

  // Close first so the panel slides away while the next screen takes over.
  const go = (to) => {
    onClose();
    navigate(to);
  };

  // Ends the session on the device at once; AuthGuard then leaves Home for Welcome. The panel stays up until it does.
  const signOut = () => {
    if (leaving) return;
    setLeaving(true);
    sessionManager.signOut();
  };

  let today;
  if (gated) {
    today = <p className="side-panel__note">{PANEL_COPY.gated}</p>;
  } else if (ambient) {
    today = (
      <>
        <p className="side-panel__amount">{formatMoney(ambient.provisionalSpend)}</p>
        {line && (
          <div className="side-panel__line">
            {line.value ? <Verdict value={line.value} label={line.label} /> : <p className="side-panel__note">{line.label}</p>}
          </div>
        )}
        {ambient.hasUnconfirmed && <Tag className="side-panel__tag">{PANEL_COPY.unconfirmed(ambient.pendingCount)}</Tag>}
      </>
    );
  } else if (failed) {
    today = (
      <>
        <p className="side-panel__note">{PANEL_COPY.loadFailed}</p>
        <Button variant="ghost" className="side-panel__retry" onClick={retry}>
          {PANEL_COPY.retry}
        </Button>
      </>
    );
  } else {
    today = (
      <div className="side-panel__amount">
        <Spinner size="sm" />
      </div>
    );
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      footer={
        <Button variant="secondary" block busy={leaving} onClick={signOut}>
          {PANEL_COPY.signOut}
        </Button>
      }
    >
      <section className="side-panel__today" aria-label={PANEL_COPY.today}>
        <p className="side-panel__label">{PANEL_COPY.today}</p>
        {today}
      </section>
      <nav className="side-panel__nav" aria-label={PANEL_COPY.navLabel}>
        {NAV_ITEMS.map(({ key, label }) => (
          <button key={key} type="button" className="side-panel__link" onClick={() => go(destinations[key])}>
            {label}
          </button>
        ))}
      </nav>
    </Drawer>
  );
}
