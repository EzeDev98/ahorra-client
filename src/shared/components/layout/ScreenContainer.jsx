import './ScreenContainer.css';
import { cx } from '@shared/utils/classNames.js';

// The outer frame of every screen except Home: full height, phone safe areas respected,
// content centred at the content width. `as` changes the outer element (default <main>).
export default function ScreenContainer({ as: Tag = 'main', className, children, ...rest }) {
  return (
    <Tag className={cx('ui-screen', className)} {...rest}>
      <div className="ui-screen__inner">{children}</div>
    </Tag>
  );
}
