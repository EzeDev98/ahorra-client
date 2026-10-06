import { useState } from 'react';
import './Install.css';
import FormScreen from '@shared/components/layout/FormScreen.jsx';
import Button from '@shared/components/ui/Button.jsx';
import InfoBanner from '@shared/components/ui/InfoBanner.jsx';
import { DONE_EMOJI, HANDOFF_COPY, HANDOFF_PLACE, PHONE_EMOJI } from './installContent.js';
import PhoneFeed from './PhoneFeed.jsx';

// How long to wait after window.close() before concluding the browser refused. Browsers ignore close() on tabs
// they did not open from a script, which is every tab a person opened themselves.
const CLOSE_FALLBACK_MS = 400;

// The install hand-off, in two steps. First "Installing Ahorra…" with Continue. Continue tries to close the tab; when
// the browser refuses, the screen becomes "You're all set!" and asks the person to close the tab themselves.
// Nothing here navigates: the point is to move the person off the browser and onto the installed app.
// platform: from getInstallPlatform(), only used to say where the app icon will be.
export default function InstallHandoff({ platform }) {
  const [closeBlocked, setCloseBlocked] = useState(false);
  const place = HANDOFF_PLACE[platform] ?? HANDOFF_PLACE.android;

  const handleContinue = () => {
    window.close();
    setTimeout(() => setCloseBlocked(true), CLOSE_FALLBACK_MS);
  };

  return (
    <FormScreen
      className="install-card"
      hero={closeBlocked ? <span className="install__hero" aria-hidden="true">{DONE_EMOJI}</span> : <PhoneFeed />}
      title={closeBlocked ? HANDOFF_COPY.doneTitle : HANDOFF_COPY.installingTitle}
      description={HANDOFF_COPY.description(place)}
      footer={
        closeBlocked ? undefined : (
          <Button block onClick={handleContinue}>
            {HANDOFF_COPY.continue}
          </Button>
        )
      }
    >
      <InfoBanner emoji={PHONE_EMOJI}>{HANDOFF_COPY.banner(place)}</InfoBanner>
      {closeBlocked && <p className="install__footnote">{HANDOFF_COPY.closeNote}</p>}
    </FormScreen>
  );
}
