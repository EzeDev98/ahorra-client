// True when the app is running as an installed app (standalone window), false in an ordinary browser tab.
// iOS Safari reports it through navigator.standalone; every other browser through the display-mode media query.
export function isPWAInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}
