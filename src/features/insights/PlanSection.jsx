import Bar from '@shared/components/ui/Bar.jsx';
import Card from '@shared/components/ui/Card.jsx';
import InfoBanner from '@shared/components/ui/InfoBanner.jsx';
import { formatMoney } from '@shared/utils/formatMoney.js';
import { PLAN_COPY } from './insightsContent.js';
import usePlan from './usePlan.js';

// Which line sits under a share's name: for Needs, what fixed obligations take and what is left; for the others, nothing.
function detail(bucket) {
  if (bucket.key !== 'NEEDS' || Number(bucket.committed) <= 0) return null;
  const room = Number(bucket.room);
  const left = room < 0 ? PLAN_COPY.over(formatMoney(Math.abs(room))) : PLAN_COPY.room(formatMoney(room));
  return `${PLAN_COPY.obligations(formatMoney(bucket.committed))}. ${left}.`;
}

// The spending plan for this period (Step 19), the first thing on Insights. Three shares with their targets. From day 30
// each share also shows what confirmed entries add up to so far, beside the same target. Numbers and plain words only.
// Nothing is shown until the plan has loaded, or if it cannot be loaded.
export default function PlanSection() {
  const { plan } = usePlan();
  if (!plan) return null;

  const observed = plan.phase === 'OBSERVED';

  return (
    <section>
      <h2 className="insights__heading">{PLAN_COPY.heading}</h2>
      <Card>
        <p className="insights__sub">{observed ? PLAN_COPY.observed : PLAN_COPY.starter}</p>
        <div className="insights__categories">
          {plan.buckets.map((bucket) => {
            const note = detail(bucket);
            const seen = bucket.observed;
            const caption =
              seen == null
                ? null
                : (bucket.key === 'SAVINGS' ? PLAN_COPY.unspent : PLAN_COPY.seen)(formatMoney(seen), formatMoney(bucket.target));
            return (
              <div key={bucket.key} className="insights__category">
                <div className="insights__category-top">
                  <span>
                    {PLAN_COPY.bucket[bucket.key]} {PLAN_COPY.share(bucket.sharePercent)}
                  </span>
                  <span className="insights__amount">{formatMoney(bucket.target)}</span>
                </div>
                {note && <p className="insights__sub">{note}</p>}
                {caption && (
                  <>
                    <Bar
                      value={seen}
                      max={bucket.target}
                      tone={bucket.key !== 'SAVINGS' && Number(seen) > Number(bucket.target) ? 'over' : 'brand'}
                      label={caption}
                    />
                    <p className="insights__sub">{caption}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
        {plan.obligationsExceedNeeds && <InfoBanner>{PLAN_COPY.exceed}</InfoBanner>}
      </Card>
    </section>
  );
}
