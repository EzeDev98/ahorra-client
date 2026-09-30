import './Badge.css';
import { cx } from '@shared/utils/classNames.js';

// A filled count. Renders nothing at zero. floating pins it to the top-right corner of its parent
// (the parent must be position: relative, as IconButton is) and hides it from screen readers,
// because the parent's label already says the count ("2 entries waiting").
export default function Badge({ count, max = 99, floating = false, className }) {
  if (!count || count < 1) return null;
  const text = count > max ? `${max}+` : String(count);

  return (
    <span
      className={cx('ui-badge', floating && 'ui-badge--floating', className)}
      aria-hidden={floating || undefined}
    >
      {text}
    </span>
  );
}
