import { Info, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import './Verdict.css';
import { cx } from '@shared/utils/classNames.js';

// One entry per server verdict. The icon and the word always travel with the colour, so colour is never alone.
// Over baseline is terracotta, never red: red only means something broke.
const VERDICTS = {
  OVER: { icon: TrendingUp, label: 'Over baseline', tone: 'over' },
  ON_TRACK: { icon: Minus, label: 'On track', tone: 'on-track' },
  UNDER: { icon: TrendingDown, label: 'Under baseline', tone: 'under' },
  NO_INCOME_SET: { icon: Info, label: 'Income not set', tone: 'muted' },
};

// value: 'OVER' | 'ON_TRACK' | 'UNDER' | 'NO_INCOME_SET' (the server's ReportVerdict). Unknown or empty renders nothing.
// label replaces the default wording where a screen has its own, such as "Above your usual" in the side panel.
export default function Verdict({ value, label, className }) {
  const verdict = VERDICTS[value];
  if (!verdict) return null;
  const Icon = verdict.icon;

  return (
    <span className={cx('ui-verdict', `ui-verdict--${verdict.tone}`, className)}>
      <Icon className="ui-verdict__icon" aria-hidden="true" />
      <span>{label ?? verdict.label}</span>
    </span>
  );
}
