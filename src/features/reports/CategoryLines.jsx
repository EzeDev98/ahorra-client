import Card from '@shared/components/ui/Card.jsx';
import DetailRow from '@shared/components/ui/DetailRow.jsx';
import { formatMoney } from '@shared/utils/formatMoney.js';
import { DETAIL_COPY } from './reportDetailContent.js';
import { formatPercent } from './reportFormat.js';

// A report's category lines: name, amount, share of the spend and, for the period, how much of the excess the category
// accounts for (attributedExcess is null for day lines and only shown when above zero).
// lines: CategoryLine[] = { name, amount, sharePercent, attributedExcess }.
export default function CategoryLines({ lines }) {
  return (
    <Card>
      {lines.map((line) => {
        const excess = Number(line.attributedExcess) > 0 ? ` · ${DETAIL_COPY.excess(formatMoney(line.attributedExcess))}` : '';
        return (
          <DetailRow key={line.name} label={line.name}>
            <span>{formatMoney(line.amount)}</span>
            <span className="report__sub">{formatPercent(line.sharePercent)}{excess}</span>
          </DetailRow>
        );
      })}
    </Card>
  );
}
