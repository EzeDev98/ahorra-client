import './Install.css';
import { PHONE_EMOJI } from './installContent.js';

// The install hero: an arrow slides into a phone, over and over, like a file arriving on the device.
// The arrow is drawn here, not taken from the 📲 emoji, because an emoji's arrow cannot move on its own.
// Decorative: the title and description say what is happening.
export default function PhoneFeed() {
  return (
    <div className="install__feed" aria-hidden="true">
      <svg className="install__feed-arrow" viewBox="40 40 120 120">
        <polygon points="48,48 152,100 48,152 82,100" />
      </svg>
      <span className="install__feed-phone">{PHONE_EMOJI}</span>
    </div>
  );
}
