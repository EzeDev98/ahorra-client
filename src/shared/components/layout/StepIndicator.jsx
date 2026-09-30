import './StepIndicator.css';
import { cx } from '@shared/utils/classNames.js';

// "Step 1 of 2" with a segment per step. Used by the two-step registration.
export default function StepIndicator({ current, total, className }) {
  return (
    <div className={cx('ui-steps', className)}>
      <div className="ui-steps__bars" aria-hidden="true">
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            className={cx('ui-steps__bar', index < current && 'ui-steps__bar--done')}
          />
        ))}
      </div>
      <p className="ui-steps__text">
        Step {current} of {total}
      </p>
    </div>
  );
}
