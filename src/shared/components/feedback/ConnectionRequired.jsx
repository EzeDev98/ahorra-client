import { WifiOff } from 'lucide-react';
import EmptyState from '@shared/components/ui/EmptyState.jsx';
import ScreenContainer from '@shared/components/layout/ScreenContainer.jsx';
import AppLogo from '@shared/components/branding/AppLogo.jsx';
import './ConnectionRequired.css';

export default function ConnectionRequired() {
  return (
    <ScreenContainer className="connection-required" role="alert">
      <AppLogo className="connection-required__logo" />
      <EmptyState
        icon={WifiOff}
        title="A connection is needed"
        description="Ahorra works online. You will continue where you left off as soon as you are connected."
      />
    </ScreenContainer>
  );
}
