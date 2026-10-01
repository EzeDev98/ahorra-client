// True when this page is running as the installed app, or the browser says the app is installed on this device.
// Display mode alone cannot decide it: Chrome reports 'fullscreen' for an ordinary browser tab while the browser is
// in full screen, so a tab and an app window look the same. The browser's own installed-apps answer does not have
// that problem. It is asked once per page load (detectInstalledApp) and never stored, so an uninstall is noticed
// the next time the link is opened. Only Chrome and Edge can answer (desktop 140 and later, Android).
let installedInBrowser = false;

const ASK_TIMEOUT_MS = 2000;

export async function detectInstalledApp() {
  try {
    const timeout = new Promise((resolve) => setTimeout(() => resolve([]), ASK_TIMEOUT_MS));
    const apps = await Promise.race([navigator.getInstalledRelatedApps?.() ?? [], timeout]);
    installedInBrowser = apps.some((app) => app.platform === 'webapp');
  } catch {
    installedInBrowser = false;
  }
}

// Called when the browser reports that this page has just been installed.
export function markInstalled() {
  installedInBrowser = true;
}

export function isPWAInstalled() {
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  if (navigator.standalone === true) return true;
  return installedInBrowser;
}
