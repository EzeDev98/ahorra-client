import { useNavigate } from 'react-router';
import './Behavior.css';
import PageHeader from '@shared/components/layout/PageHeader.jsx';
import ScreenContainer from '@shared/components/layout/ScreenContainer.jsx';
import Button from '@shared/components/ui/Button.jsx';
import InfoBanner from '@shared/components/ui/InfoBanner.jsx';
import Skeleton from '@shared/components/ui/Skeleton.jsx';
import BehaviorBody from './BehaviorBody.jsx';
import { BEHAVIOR_COPY } from './behaviorContent.js';
import useBehaviorOverview from './useBehaviorOverview.js';

// Route "/behavior" (Step 10e). What the app has learned about the person's spending (GET /behavior/overview): observation
// mode for the first weeks, then baselines, habits and the trend. Inner screen: top-aligned under PageHeader (Guide 4.8).
// backTo: Home. Passed in so this file holds no path.
export default function Behavior({ backTo }) {
  const navigate = useNavigate();
  const { overview, isPending, loadFailed, retrying, retry } = useBehaviorOverview();

  let body;
  if (loadFailed) {
    body = (
      <InfoBanner
        tone="error"
        action={
          <Button variant="secondary" busy={retrying} onClick={retry}>
            {BEHAVIOR_COPY.retry}
          </Button>
        }
      >
        {BEHAVIOR_COPY.loadFailed}
      </InfoBanner>
    );
  } else if (isPending || !overview) {
    body = (
      <Skeleton rows={4} />
    );
  } else {
    body = <BehaviorBody data={overview} />;
  }

  return (
    <ScreenContainer>
      <PageHeader title={BEHAVIOR_COPY.title} onBack={() => navigate(backTo)} />
      {body}
    </ScreenContainer>
  );
}
