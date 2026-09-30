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
import ErrorBoundary from '@shared/components/feedback/ErrorBoundary.jsx';
import App from '@app/App.jsx';

configureHttpClient({
  getAccessToken: sessionManager.getAccessToken,
  refreshAccessToken: sessionManager.refresh,
  onSessionRevoked: sessionManager.handleSessionRevoked,
});

// Sign-out, revocation and expiry all end the session: drop every cached answer.
sessionManager.subscribe(() => {
  if (!sessionManager.hasSession()) clearQueryData();
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
