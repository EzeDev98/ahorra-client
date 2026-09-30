import './AppLogo.css';
import { cx } from '@shared/utils/classNames.js';

// Placeholder wordmark until the real logo exists. When it does, this is the only file that changes.
// size: 'md' | 'lg' (lg is text-lg, the largest text size in the app).
export default function AppLogo({ size = 'md', className }) {
  return <span className={cx('ui-logo', `ui-logo--${size}`, className)}>Ahorra</span>;
}
