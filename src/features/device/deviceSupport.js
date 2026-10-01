// Decides once whether this browser can run Ahorra. Returns { supported: true } or { supported: false, reason, desktop }.
//   'colors'          no CSS light-dark(): every colour token uses it, so nothing would be coloured
//                     (Safari and iOS before 17.5, Chrome before 123, Firefox before 120)
//   'desktop-firefox' desktop Firefox cannot install web apps, and install is mandatory
const hasLightDark = () =>
  typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('color', 'light-dark(red, blue)');

export function getDeviceSupport() {
  const ua = navigator.userAgent;
  const touchMac = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1; // iPad asking for the desktop site
  const desktop = !touchMac && !/Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(ua);

  if (desktop && /Firefox\//.test(ua)) return { supported: false, reason: 'desktop-firefox', desktop };
  if (!hasLightDark()) return { supported: false, reason: 'colors', desktop };
  return { supported: true };
}
