import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router';
import './Reports.css';
import PageHeader from '@shared/components/layout/PageHeader.jsx';
import ScreenContainer from '@shared/components/layout/ScreenContainer.jsx';
import Button from '@shared/components/ui/Button.jsx';
import EmptyState from '@shared/components/ui/EmptyState.jsx';
import InfoBanner from '@shared/components/ui/InfoBanner.jsx';
import Spinner from '@shared/components/ui/Spinner.jsx';
import ReportRow from './ReportRow.jsx';
import { REPORTS_COPY } from './reportsContent.js';
import useReportList from './useReportList.js';

// Route "/reports" (Step 10b). The last 30 days of daily reports, newest first (GET /report/daily). Each row opens that
// day's full report (Step 10c). Inner list screen: top-aligned under PageHeader, not the centred group (Guide 4.8).
// backTo: Home. detailTo: a function that turns a date into the report's path. Passed in so this file holds no path.
export default function Reports({ backTo, detailTo }) {
  const navigate = useNavigate();
  const { reports, isPending, loadFailed, retrying, retry } = useReportList();

  let body;
  if (loadFailed) {
    body = (
      <InfoBanner
        tone="error"
        action={
          <Button variant="secondary" busy={retrying} onClick={retry}>
            {REPORTS_COPY.retry}
          </Button>
        }
      >
        {REPORTS_COPY.loadFailed}
      </InfoBanner>
    );
  } else if (isPending) {
    body = (
      <div className="reports__loading">
        <Spinner />
      </div>
    );
  } else if (reports.length === 0) {
    body = <EmptyState icon={FileText} title={REPORTS_COPY.emptyTitle} description={REPORTS_COPY.emptyDescription} />;
  } else {
    body = (
      <ul className="reports__list">
        {reports.map((report) => (
          <li key={report.date}>
            <ReportRow report={report} onOpen={() => navigate(detailTo(report.date))} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ScreenContainer>
      <PageHeader title={REPORTS_COPY.title} onBack={() => navigate(backTo)} />
      {body}
    </ScreenContainer>
  );
}
