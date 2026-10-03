import { useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router';
import './SettingsAppearance.css';
import PageHeader from '@shared/components/layout/PageHeader.jsx';
import ScreenContainer from '@shared/components/layout/ScreenContainer.jsx';
import Radio from '@shared/components/ui/Radio.jsx';
import { APPEARANCE_COPY } from './appearanceContent.js';
import { themeStore } from './themeStore.js';

// Route "/settings/appearance" (Step 11e). Light, dark, or the same as the device. The choice applies at once and is kept on
// this device (themeStore). Radio is the only round shape in the app (Guide 4.4). Inner screen: top-aligned under PageHeader.
// backTo: Settings. Passed in so this file holds no path.
export default function SettingsAppearance({ backTo }) {
  const navigate = useNavigate();
  const mode = useSyncExternalStore(themeStore.subscribe, themeStore.get);

  return (
    <ScreenContainer>
      <PageHeader title={APPEARANCE_COPY.title} onBack={() => navigate(backTo)} />
      <div role="radiogroup" aria-label={APPEARANCE_COPY.group} className="settings-appearance">
        {APPEARANCE_COPY.options.map((option) => (
          <Radio
            key={option.value}
            name="appearance-theme"
            value={option.value}
            label={option.label}
            hint={option.hint ?? undefined}
            checked={mode === option.value}
            onChange={() => themeStore.set(option.value)}
          />
        ))}
      </div>
    </ScreenContainer>
  );
}
