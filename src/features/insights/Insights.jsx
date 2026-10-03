import { Wallet } from 'lucide-react';
import { useNavigate } from 'react-router';
import './Insights.css';
import PageHeader from '@shared/components/layout/PageHeader.jsx';
import ScreenContainer from '@shared/components/layout/ScreenContainer.jsx';
import Button from '@shared/components/ui/Button.jsx';
import EmptyState from '@shared/components/ui/EmptyState.jsx';
import InfoBanner from '@shared/components/ui/InfoBanner.jsx';
import Spinner from '@shared/components/ui/Spinner.jsx';
import InsightsBody from './InsightsBody.jsx';
import { INSIGHTS_COPY } from './insightsContent.js';
import useVariance from './useVariance.js';

// Route "/insights" (Step 10d). Spend against the income baseline for the current period, by category
// (GET /income/variance). Plain lists and simple bars, no chart library. Inner screen: top-aligned under PageHeader (Guide 4.8).
// backTo: Home. incomeTo: where income is set. Passed in so this file holds no path.
export default function Insights({ backTo, incomeTo }) {
  const navigate = useNavigate();
  const { variance, isPending, notFound, loadFailed, retrying, retry } = useVariance();

  let body;
  if (notFound) {
    body = (
      <EmptyState
        icon={Wallet}
        title={INSIGHTS_COPY.noIncomeTitle}
        description={INSIGHTS_COPY.noIncomeDescription}
        action={<Button variant="secondary" onClick={() => navigate(incomeTo)}>{INSIGHTS_COPY.setIncome}</Button>}
      />
    );
  } else if (loadFailed) {
    body = (
      <InfoBanner
        tone="error"
        action={
          <Button variant="secondary" busy={retrying} onClick={retry}>
            {INSIGHTS_COPY.retry}
          </Button>
        }
      >
        {INSIGHTS_COPY.loadFailed}
      </InfoBanner>
    );
  } else if (isPending || !variance) {
    body = (
      <div className="insights__loading">
        <Spinner />
      </div>
    );
  } else {
    body = <InsightsBody data={variance} />;
  }

  return (
    <ScreenContainer>
      <PageHeader title={INSIGHTS_COPY.title} onBack={() => navigate(backTo)} />
      {body}
    </ScreenContainer>
  );
}
