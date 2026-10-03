// Whether the daily reminder is switched on for this device (Step 12). Kept on the device, like the theme: the server has
// no per-user notification setting. The browser's own permission is checked separately, so a permission taken away in the
// browser settings still shows as off.
const KEY = 'ahorra.reminder';

export const reminderStore = {
  isOn() {
    try {
      return localStorage.getItem(KEY) === 'on';
    } catch {
      return false;
    }
  },

  set(on) {
    try {
      if (on) localStorage.setItem(KEY, 'on');
      else localStorage.removeItem(KEY);
    } catch {
      // Storage unavailable: the reminder simply shows as off next time.
    }
  },
};
