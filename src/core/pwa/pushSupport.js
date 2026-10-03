import { getInstallPlatform } from './installPlatform.js';
import { isPWAInstalled } from './isPWAInstalled.js';

// Whether this page can use web push (Step 12a).
//   'supported'      the browser has the service worker, push and notification APIs
//   'needs-install'  iPhone or iPad in Safari: web push exists only for the installed app
//   'unsupported'    anything else (an app's built-in browser, an old browser)
export function pushSupport() {
  const hasApis = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  if (hasApis) return 'supported';
  return getInstallPlatform() === 'ios' && !isPWAInstalled() ? 'needs-install' : 'unsupported';
}
