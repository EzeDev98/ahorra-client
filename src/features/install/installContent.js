import { Check, Download, EllipsisVertical, ExternalLink, MonitorDown, Share, SquarePlus } from 'lucide-react';

// All Install copy lives here, so changing a word never means touching the screen.
export const COPY = {
  title: 'Install Ahorra',
  description: 'Ahorra runs as an installed app. Install it to continue.',
  manualDescription: 'Ahorra runs as an installed app. Follow these steps to add it.',
  cancelled: 'Install was cancelled. You can still add Ahorra with the steps below.',
  handoffTitle: 'Ahorra is installed',
  closeTab: 'Close this tab',
  closeFailed: 'This tab could not close itself. You can close it yourself.',
};

// Where the installed app appears, for the hand-off line.
export const HANDOFF_PLACE = {
  ios: 'your Home Screen',
  'ios-inapp': 'your Home Screen',
  android: 'your home screen',
  desktop: 'your app list or taskbar',
  'safari-desktop': 'your Dock',
};

// Manual steps per platform. Line icons only.
export const MANUAL_STEPS = {
  ios: [
    { icon: Share, text: 'Tap the Share button in your browser toolbar.' },
    { icon: SquarePlus, text: 'Scroll down and tap Add to Home Screen.' },
    { icon: Check, text: 'Tap Add, then open Ahorra from your Home Screen.' },
  ],
  'ios-inapp': [
    { icon: EllipsisVertical, text: 'Open the menu in this app. It is usually the Share icon or three dots.' },
    { icon: ExternalLink, text: 'Choose Open in Safari, then come back to this screen.' },
  ],
  'safari-desktop': [
    { icon: Share, text: 'Click the Share button in the Safari toolbar, or open the File menu.' },
    { icon: SquarePlus, text: 'Choose Add to Dock. This needs macOS Sonoma or newer.' },
    { icon: Check, text: 'Click Add, then open Ahorra from your Dock.' },
  ],
  android: [
    { icon: EllipsisVertical, text: 'Open the browser menu (the three dots).' },
    { icon: Download, text: 'Tap Install app or Add to Home screen.' },
    { icon: Check, text: 'Confirm, then open Ahorra from your home screen.' },
  ],
  desktop: [
    { icon: MonitorDown, text: 'Look for the install icon at the right end of the address bar, or open the browser menu.' },
    { icon: Download, text: 'Choose Install Ahorra. In Edge, choose Apps, then Install this site as an app.' },
    { icon: Check, text: 'Confirm, then open Ahorra from your app list or taskbar.' },
  ],
};
