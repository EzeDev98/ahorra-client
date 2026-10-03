// The only place environment values are read. Nothing else in the app writes a URL.
const raw = import.meta.env.VITE_API_BASE_URL;

if (!raw) {
  throw new Error('VITE_API_BASE_URL is not set. Copy .env.example to .env and restart the dev server.');
}

// Throws on a value that is not an absolute URL.
new URL(raw);

export const env = Object.freeze({
  // Includes the server's base path (/api/v1), no trailing slash.
  apiBaseUrl: raw.replace(/\/+$/, ''),
  // Areas served by a local stand-in instead of the server (comma list in VITE_STAND_INS). Remove a name once its endpoint exists.
  standIns: Object.freeze(
    (import.meta.env.VITE_STAND_INS ?? '').split(',').map((name) => name.trim()).filter(Boolean),
  ),
  // Public key for web push (VAPID). Empty until the server has one; the push stand-in works without it.
  vapidPublicKey: (import.meta.env.VITE_VAPID_PUBLIC_KEY ?? '').trim(),
  // Development only: lets a browser tab use the app without installing it. Always false in a production build.
  skipInstallGuard: import.meta.env.DEV && import.meta.env.VITE_SKIP_INSTALL_GUARD === 'true',
});
