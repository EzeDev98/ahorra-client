import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import "./shared/components/ui/patternfly.js";
import "./styles/fonts.css";
import "./styles/tokens.css";
import "./styles/reset.css";
import "./styles/base.css";
import "./styles/bridge.css";
import "./shared/components/ui/patternfly.js";
import "./styles/fonts.css";
import "./styles/tokens.css";
import "./styles/reset.css";
import "./styles/base.css";
import "./styles/bridge.css";
import App from '@app/App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
