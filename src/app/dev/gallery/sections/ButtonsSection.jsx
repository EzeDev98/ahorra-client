import { useState } from 'react';
import { Bell, Menu, Plus } from 'lucide-react';
import { Row, Sample, Section } from '../Section.jsx';
import Badge from '@shared/components/ui/Badge.jsx';
import Button from '@shared/components/ui/Button.jsx';
import IconButton from '@shared/components/ui/IconButton.jsx';
import TextLink from '@shared/components/ui/TextLink.jsx';
import { ROUTES } from '@app/router/routes.js';

const VARIANTS = ['primary', 'secondary', 'ghost', 'danger'];

export default function ButtonsSection() {
  const [busy, setBusy] = useState(false);

  const simulate = () => {
    setBusy(true);
    setTimeout(() => setBusy(false), 1500);
  };

  return (
    <Section
      title="2a. Buttons and links"
      note="Hover with a mouse. Press Tab to see the keyboard focus ring. Nothing here may be underlined or outlined."
    >
      <div className="gallery__grid">
        <Sample label="Default">
          <Row>{VARIANTS.map((v) => <Button key={v} variant={v}>{v}</Button>)}</Row>
        </Sample>
        <Sample label="Disabled">
          <Row>{VARIANTS.map((v) => <Button key={v} variant={v} disabled>{v}</Button>)}</Row>
        </Sample>
        <Sample label="Busy (width must not change)">
          <Row>{VARIANTS.map((v) => <Button key={v} variant={v} busy>{v}</Button>)}</Row>
        </Sample>
        <Sample label="Click to simulate a request (1.5 s)">
          <Row><Button busy={busy} onClick={simulate}>Confirm</Button></Row>
        </Sample>
        <Sample label="Block">
          <Button block>Continue</Button>
        </Sample>
        <Sample label="Icon buttons: default, with badge, disabled">
          <Row>
            <IconButton icon={Menu} label="Open menu" />
            <IconButton icon={Bell} label="2 entries waiting"><Badge count={2} floating /></IconButton>
            <IconButton icon={Plus} label="Add" disabled />
          </Row>
        </Sample>
        <Sample label="Links (in-app and external)">
          <Row>
            <TextLink to={ROUTES.gallery}>In-app link</TextLink>
            <TextLink href="https://example.com" target="_blank" rel="noreferrer">External link</TextLink>
          </Row>
        </Sample>
      </div>
    </Section>
  );
}
