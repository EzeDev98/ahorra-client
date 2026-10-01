import { Navigate, useNavigate } from 'react-router';
import './Onboarding.css';
import { isPWAInstalled } from '@core/pwa/isPWAInstalled.js';
import AppLogo from '@shared/components/branding/AppLogo.jsx';
import ScreenContainer from '@shared/components/layout/ScreenContainer.jsx';
import Button from '@shared/components/ui/Button.jsx';
import { FEATURES, TAGLINE } from './onboardingContent.js';

// Route "/". The first screen in a browser tab. Already installed: straight on to Welcome.
// installTo, welcomeTo: where "Get started" and the installed redirect lead. Passed in so this file holds no path
// (Step 5 supplies them from routes.js).
export default function Onboarding({ installTo, welcomeTo }) {
  const navigate = useNavigate();

  if (isPWAInstalled()) return <Navigate to={welcomeTo} replace />;

  return (
    <ScreenContainer className="onboarding">
      <div className="onboarding__bar">
        <AppLogo />
      </div>
      <h1 className="onboarding__title">{TAGLINE}</h1>
      <ul className="onboarding__features">
        {FEATURES.map(({ id, icon: Icon, title, description }) => (
          <li key={id} className="onboarding__feature">
            <Icon className="onboarding__icon" aria-hidden="true" />
            <div>
              <p className="onboarding__feature-title">{title}</p>
              <p className="onboarding__feature-text">{description}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="onboarding__footer">
        <Button block onClick={() => navigate(installTo)}>
          Get started
        </Button>
      </div>
    </ScreenContainer>
  );
}
