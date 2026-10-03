// All side panel copy lives here (Guide 7.2), so changing a word never means touching the component.
export const PANEL_COPY = {
  today: 'Today',
  unconfirmed: (count) => `${count} unconfirmed`,
  nothingLogged: 'Nothing logged yet',
  // The server refuses today's figures while the day is gated, so the panel says so instead of showing a total.
  gated: 'Today\u2019s total returns once your pending entries are confirmed.',
  loadFailed: 'Could not load today\u2019s total.',
  retry: 'Try again',
  navLabel: 'Main',
  signOut: 'Sign out',
};

// The panel's own words for how today compares with a usual day. Verdict supplies the icon and the colour.
export const USUAL_WORDS = {
  above: 'Above your usual',
  below: 'Below your usual',
  about: 'About your usual',
};

// Navigation, in order. key picks the path from the `destinations` prop (see routeConfig.jsx).
export const NAV_ITEMS = [
  { key: 'reports', label: 'Reports' },
  { key: 'insights', label: 'Insights' },
  { key: 'behavior', label: 'Behaviour' },
  { key: 'settings', label: 'Settings' },
];
