import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import './Settings.css';
import PageHeader from '@shared/components/layout/PageHeader.jsx';
import ScreenContainer from '@shared/components/layout/ScreenContainer.jsx';
import Card from '@shared/components/ui/Card.jsx';
import { SETTINGS_COPY } from './settingsContent.js';

// Route "/settings" (Step 11a). The hub, reached from the side panel: one row for each settings screen. Inner list
// screen: top-aligned under PageHeader (Guide 4.8).
// backTo: Home. destinations: { income, account, security, appearance, about } paths, passed in so this file holds no path.
export default function Settings({ backTo, destinations }) {
  const navigate = useNavigate();

  return (
    <ScreenContainer>
      <PageHeader title={SETTINGS_COPY.title} onBack={() => navigate(backTo)} />
      <Card>
        <ul className="settings__list">
          {SETTINGS_COPY.items.map(({ key, label }) => (
            <li key={key}>
              <button type="button" className="settings__row" onClick={() => navigate(destinations[key])}>
                <span>{label}</span>
                <ChevronRight className="settings__chevron" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </ScreenContainer>
  );
}
