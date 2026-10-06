import '@core/pwa/installPrompt.js';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import './shared/components/ui/patternfly.js';
import './styles/fonts.css';
import './styles/tokens.css';
import './styles/reset.css';
import './styles/base.css';
import './styles/bridge.css';
import { configureHttpClient } from '@core/http/httpClient.js';
import { clearQueryData, queryClient } from '@core/data/queryClient.js';
import { sessionManager } from '@features/auth/session/sessionManager.js';
import { startRefreshAhead } from '@features/auth/session/refreshAhead.js';
import { startAutoLock } from '@features/lock/autoLock.js';
import { startTheme } from '@features/settings/appearance/themeStore.js';
import { startThemeSync } from '@features/settings/appearance/themeSync.js';
import { startResurface } from '@features/home/resurface.js';
import ErrorBoundary from '@shared/components/feedback/ErrorBoundary.jsx';
import DeviceGate from '@features/device/DeviceGate.jsx';
import App from '@app/App.jsx';
import { appUpdate } from '@core/pwa/appUpdate.js';
import { registerServiceWorker } from '@core/pwa/registerServiceWorker.js';

startTheme();

configureHttpClient({
  getAccessToken: sessionManager.getAccessToken,
  refreshAccessToken: sessionManager.refresh,
  onSessionRevoked: sessionManager.handleSessionRevoked,
});

// Sign-out, revocation and expiry all end the session: drop every cached answer.
sessionManager.subscribe(() => {
  if (!sessionManager.hasSession()) clearQueryData();
});

startRefreshAhead();
startAutoLock();
startResurface();
registerServiceWorker();
appUpdate.start();
startThemeSync();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <DeviceGate>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </DeviceGate>
    </ErrorBoundary>
  </StrictMode>,
);
