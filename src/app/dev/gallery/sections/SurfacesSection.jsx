import { Inbox } from 'lucide-react';
import { Row, Sample, Section } from '../Section.jsx';
import Badge from '@shared/components/ui/Badge.jsx';
import Bar from '@shared/components/ui/Bar.jsx';
import Button from '@shared/components/ui/Button.jsx';
import Card from '@shared/components/ui/Card.jsx';
import DetailRow from '@shared/components/ui/DetailRow.jsx';
import EmptyState from '@shared/components/ui/EmptyState.jsx';
import InfoBanner from '@shared/components/ui/InfoBanner.jsx';
import Spinner from '@shared/components/ui/Spinner.jsx';
import Tag from '@shared/components/ui/Tag.jsx';
import { useToast } from '@shared/components/ui/toastContext.js';

export default function SurfacesSection() {
  const toast = useToast();

  return (
    <Section title="2c. Surfaces and feedback" note="Banner tone is carried by the icon as well as the colour.">
      <div className="gallery__grid">
        <Sample label="Card">
          <Card>Bread 500, egg 300 and bottle water 200.</Card>
        </Sample>
        <Sample label="DetailRow inside a Card">
          <Card>
            <DetailRow label="Spent today">₦3,000</DetailRow>
            <DetailRow label="Baseline">₦1,500,000</DetailRow>
            <DetailRow label="Entries">4</DetailRow>
          </Card>
        </Sample>
        <Sample label="InfoBanner: info, success, warning, error">
          <div className="gallery__stack">
            <InfoBanner>Your entries are saved on the server.</InfoBanner>
            <InfoBanner tone="success">Income updated.</InfoBanner>
            <InfoBanner tone="warning">Two entries are still waiting.</InfoBanner>
            <InfoBanner tone="error">Could not reach the server.</InfoBanner>
          </div>
        </Sample>
        <Sample label="InfoBanner with title and action">
          <InfoBanner tone="warning" title="It is past 22:00" action={<Button variant="secondary">Review</Button>}>
            Confirm your pending entries to continue.
          </InfoBanner>
        </Sample>
        <Sample label="Tag and Badge">
          <Row>
            <Tag>2 unconfirmed</Tag>
            <Tag tone="brand">New</Tag>
            <Badge count={1} />
            <Badge count={12} />
            <Badge count={120} />
          </Row>
        </Sample>
        <Sample label="Bar (brand, over, under, muted)">
          <div className="gallery__stack">
            <Bar value={40} max={100} label="40 percent" />
            <Bar value={90} max={100} tone="over" label="90 percent" />
            <Bar value={60} max={100} tone="under" label="60 percent" />
            <Bar value={25} max={100} tone="muted" label="25 percent" />
          </div>
        </Sample>
        <Sample label="Spinner (sm, md)">
          <Row>
            <Spinner size="sm" />
            <Spinner />
          </Row>
        </Sample>
        <Sample label="Toast">
          <Row>
            <Button variant="secondary" onClick={() => toast.show('Entry confirmed')}>Neutral</Button>
            <Button variant="secondary" onClick={() => toast.show('Income updated', { tone: 'success' })}>Success</Button>
            <Button variant="secondary" onClick={() => toast.show('Could not confirm the entry', { tone: 'error' })}>Error</Button>
          </Row>
        </Sample>
        <Sample label="EmptyState">
          <Card>
            <EmptyState
              icon={Inbox}
              title="No reports yet"
              description="Your first report appears once a day is settled."
              action={<Button variant="secondary">Go to Home</Button>}
            />
          </Card>
        </Sample>
      </div>
    </Section>
  );
}
