import './Card.css';
import { cx } from '@shared/utils/classNames.js';

// as: the element to render ('div', 'article', 'section', 'li'). Extra props pass through.
export default function Card({ as: Tag = 'div', className, children, ...rest }) {
  return (
    <Tag className={cx('ui-card', className)} {...rest}>
      {children}
    </Tag>
  );
}
