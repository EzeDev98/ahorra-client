import { useEffect, useState } from 'react';
import './gallery.css';
import ButtonsSection from './sections/ButtonsSection.jsx';
import FormsSection from './sections/FormsSection.jsx';
import LayoutSection from './sections/LayoutSection.jsx';
import MotionSection from './sections/MotionSection.jsx';
import OverlaysSection from './sections/OverlaysSection.jsx';
import SurfacesSection from './sections/SurfacesSection.jsx';
import TypographySection from './sections/TypographySection.jsx';
import Radio from '@shared/components/ui/Radio.jsx';
import ToastProvider from '@shared/components/ui/ToastProvider.jsx';

const THEMES = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

// Dev only (see App.jsx). Every design-system component in every state, in light and dark.
export default function ComponentGallery() {
  const [theme, setTheme] = useState('system');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    return () => root.removeAttribute('data-theme');
  }, [theme]);

  return (
    <ToastProvider>
      <main className="gallery">
        <header className="gallery__head">
          <h1 className="gallery__heading">Component gallery</h1>
          <p className="gallery__note">
            Dev only. Check every component in light and dark, with the mouse and with the keyboard (Tab), and on a phone width.
          </p>
          <div className="gallery__row" role="radiogroup" aria-label="Theme">
            {THEMES.map((option) => (
              <Radio
                key={option.value}
                name="gallery-theme"
                label={option.label}
                checked={theme === option.value}
                onChange={() => setTheme(option.value)}
              />
            ))}
          </div>
        </header>
        <ButtonsSection />
        <FormsSection />
        <SurfacesSection />
        <OverlaysSection />
        <LayoutSection />
        <MotionSection />
        <TypographySection />
      </main>
    </ToastProvider>
  );
}
