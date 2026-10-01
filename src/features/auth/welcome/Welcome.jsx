import { useSyncExternalStore } from 'react';
import { Navigate, useNavigate } from 'react-router';
import './Welcome.css';
import { sessionManager } from '@features/auth/session/sessionManager.js';
import ScreenContainer from '@shared/components/layout/ScreenContainer.jsx';
import Button from '@shared/components/ui/Button.jsx';
import { DESCRIPTION, TITLE } from './welcomeContent.js';

// Route "/welcome". The first screen of the installed app for someone who is not signed in: Create account or Sign in.
// Google sign-in is left out until the server supports it (Guide §6.2).
// registerTo, loginTo: where the two buttons lead.
// signedInTo: where someone who already has a session is sent. Home: the route guards then move them on to Unlock
// or the income setup if either is needed. It watches the session, so signing in from another tab leaves this screen.
// All three are passed in so this file holds no path (routeConfig.jsx supplies them from routes.js).
export default function Welcome({ registerTo, loginTo, signedInTo }) {
  const navigate = useNavigate();
  const signedIn = useSyncExternalStore(sessionManager.subscribe, sessionManager.hasSession);

  if (signedIn) return <Navigate to={signedInTo} replace />;

  return (
    <ScreenContainer className="welcome">
      <div className="ui-screen__bar" aria-hidden="true" />
      <div className="ui-screen__group">
        <div className="welcome__body">
          <div className="welcome__text">
            <h1 className="welcome__title">{TITLE}</h1>
            <p className="welcome__description">{DESCRIPTION}</p>
          </div>
        </div>
        <div className="welcome__footer">
          <Button block onClick={() => navigate(registerTo)}>
            Create account
          </Button>
          <Button block variant="secondary" onClick={() => navigate(loginTo)}>
            Sign in
          </Button>
        </div>
      </div>
    </ScreenContainer>
  );
}
