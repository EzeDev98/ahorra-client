import Bar from '@shared/components/ui/Bar.jsx';
import Card from '@shared/components/ui/Card.jsx';
import DetailRow from '@shared/components/ui/DetailRow.jsx';
import InfoBanner from '@shared/components/ui/InfoBanner.jsx';
import BaselineList from './BaselineList.jsx';
import { BEHAVIOR_COPY } from './behaviorContent.js';
import { formatConfidence } from './behaviorFormat.js';
import HabitList from './HabitList.jsx';
import Section from './Section.jsx';
import TrendSection from './TrendSection.jsx';

// What the app has learned (Guide 2.3). Observation mode (the first weeks) shows how far along it is and no verdict:
// days observed, days to go, and the usual spending. Judgement mode adds the trend, the habits and, when today looks
// different, a short note. Wording stays descriptive throughout.
export default function BehaviorBody({ data }) {
  const { mode, daysObserved, daysUntilJudgment, confidence, baselines, habits, trend, todayUnusual } = data;
  const judging = mode === 'JUDGMENT';
  const total = daysObserved + daysUntilJudgment;

  return (
    <div className="behavior">
      {judging && todayUnusual === true && <InfoBanner tone="info">{BEHAVIOR_COPY.unusual}</InfoBanner>}

      {judging ? (
        <Section heading={BEHAVIOR_COPY.sectionSummary}>
          <Card>
            <DetailRow label={BEHAVIOR_COPY.daysObserved}>{daysObserved}</DetailRow>
            <DetailRow label={BEHAVIOR_COPY.confidence}>{formatConfidence(confidence)}</DetailRow>
          </Card>
        </Section>
      ) : (
        <Card className="behavior__lead">
          <p className="behavior__title">{BEHAVIOR_COPY.observationTitle}</p>
          <Bar value={daysObserved} max={total} label={BEHAVIOR_COPY.progressLabel(daysObserved, total)} />
          <p className="behavior__text">{BEHAVIOR_COPY.observationText(daysObserved, daysUntilJudgment)}</p>
        </Card>
      )}

      {judging && trend && <TrendSection trend={trend} />}

      {judging && (
        <Section heading={BEHAVIOR_COPY.sectionHabits}>
          {habits?.length > 0 ? <HabitList habits={habits} /> : <p className="behavior__empty">{BEHAVIOR_COPY.noHabits}</p>}
        </Section>
      )}

      {baselines?.length > 0 && (
        <Section heading={BEHAVIOR_COPY.sectionBaselines}>
          <BaselineList baselines={baselines} />
        </Section>
      )}
    </div>
  );
}
