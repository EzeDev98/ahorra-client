import { BrowserRouter } from 'react-router';
import NetworkGate from '@shared/components/feedback/NetworkGate.jsx';
import ToastProvider from '@shared/components/ui/ToastProvider.jsx';
import StartupGate from '@app/startup/StartupGate.jsx';
import ResumeDecision from '@app/startup/ResumeDecision.jsx';
import AnimatedRoutes from '@app/router/AnimatedRoutes.jsx';

export default function App() {
  return (
    <NetworkGate>
      <StartupGate>
        <ToastProvider>
          <BrowserRouter>
            <ResumeDecision />
            <AnimatedRoutes />
          </BrowserRouter>
        </ToastProvider>
      </StartupGate>
    </NetworkGate>
  );
}
