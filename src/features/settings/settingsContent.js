// All Settings hub copy lives here, so changing a word never means touching the screen.
export const SETTINGS_COPY = {
  title: 'Settings',
  // key picks the path from the `destinations` prop (see routeConfig.jsx).
  items: [
    { key: 'income', label: 'Income and history' },
    { key: 'obligations', label: 'Fixed obligations' },
    { key: 'account', label: 'Account' },
    { key: 'security', label: 'Security' },
    { key: 'reminder', label: 'Daily reminder' },
    { key: 'appearance', label: 'Appearance' },
    { key: 'about', label: 'About and legal' },
  ],
};
