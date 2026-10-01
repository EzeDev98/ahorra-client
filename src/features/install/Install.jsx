import { useEffect, useState, useSyncExternalStore } from 'react';
import { Navigate, useNavigate } from 'react-router';
import './Install.css';
import { clearInstallPrompt, getInstallState, subscribeInstall } from '@core/pwa/installPrompt.js';
import { canPromptInstall, getInstallPlatform } from '@core/pwa/installPlatform.js';
import { isPWAInstalled } from '@core/pwa/isPWAInstalled.js';
import FormScreen from '@shared/components/layout/FormScreen.jsx';
import Button from '@shared/components/ui/Button.jsx';
import InfoBanner from '@shared/components/ui/InfoBanner.jsx';
import { COPY, HANDOFF_PLACE, MANUAL_STEPS } from './installContent.js';

// How long to wait for the browser's install prompt before showing manual steps.
const PROMPT_WAIT_MS = 10000;

// Route "/install". Phases: waiting, ready, installing, manual, handoff.
// backTo: Onboarding. welcomeTo: where the installed app goes. Passed in so this file holds no path
// (Step 5 supplies them from routes.js).
export default function Install({ backTo, welcomeTo }) {
  const navigate = useNavigate();
  const [platform] = useState(getInstallPlatform);
  const { prompt, installed } = useSyncExternalStore(subscribeInstall, getInstallState);
  const promptable = canPromptInstall(platform);

  const [waitedOut, setWaitedOut] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [closeFailed, setCloseFailed] = useState(false);

  useEffect(() => {
    if (!promptable || prompt) return undefined;
    const timer = setTimeout(() => setWaitedOut(true), PROMPT_WAIT_MS);
    return () => clearTimeout(timer);
  }, [promptable, prompt]);

  // Catches an install finished through the browser's own UI while this page is open, which fires no appinstalled event.
  useEffect(() => {
    const query = window.matchMedia('(display-mode: standalone)');
    const onChange = (event) => {
      if (event.matches) setAccepted(true);
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  if (isPWAInstalled()) return <Navigate to={welcomeTo} replace />;

  let phase = 'waiting';
  if (installed || accepted) phase = 'handoff';
  else if (!promptable) phase = 'manual';
  else if (installing) phase = 'installing';
  else if (prompt) phase = 'ready';
  else if (cancelled || waitedOut) phase = 'manual';

  const install = async () => {
    if (!prompt) return;
    setInstalling(true);
    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') setAccepted(true);
      else setCancelled(true);
    } catch {
      setCancelled(true);
    } finally {
      clearInstallPrompt(); // the browser allows one use of the prompt
      setInstalling(false);
    }
  };

  const closeTab = () => {
    window.close(); // works only for tabs the browser lets a script close
    setTimeout(() => setCloseFailed(true), 300);
  };

  if (phase === 'handoff') {
    return (
      <FormScreen
        title={COPY.handoffTitle}
        description={`Open Ahorra from ${HANDOFF_PLACE[platform]} to continue. You can close this tab.`}
        footer={
          <Button variant="secondary" block onClick={closeTab}>
            {COPY.closeTab}
          </Button>
        }
      >
        {closeFailed && <InfoBanner>{COPY.closeFailed}</InfoBanner>}
      </FormScreen>
    );
  }

  return (
    <FormScreen
      title={COPY.title}
      description={phase === 'manual' ? COPY.manualDescription : COPY.description}
      onBack={() => navigate(backTo)}
      footer={
        phase === 'manual' ? undefined : (
          <Button block busy={phase !== 'ready'} onClick={install}>
            Install Ahorra
          </Button>
        )
      }
    >
      {phase === 'manual' && (
        <>
          {cancelled && <InfoBanner>{COPY.cancelled}</InfoBanner>}
          <ol className="install__steps">
            {MANUAL_STEPS[platform].map(({ icon: Icon, text }, index) => (
              <li key={text} className="install__step">
                <Icon className="install__icon" aria-hidden="true" />
                <div>
                  <p className="install__step-label">Step {index + 1}</p>
                  <p className="install__step-text">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}
    </FormScreen>
  );
}
