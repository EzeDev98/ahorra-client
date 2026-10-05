// A copy of the reminder choice on this device, so screens can read it without waiting for the server. The server holds
// the real choice (it survives a reinstall) and writes it here after sign-in and when Settings opens. The browser's own
// permission is checked separately, so a permission taken away in the browser settings still shows as off.
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
