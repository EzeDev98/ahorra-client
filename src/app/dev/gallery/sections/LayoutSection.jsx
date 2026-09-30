import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Row, Sample, Section } from '../Section.jsx';
import AppLogo from '@shared/components/branding/AppLogo.jsx';
import Verdict from '@shared/components/feedback/Verdict.jsx';
import FormScreen from '@shared/components/layout/FormScreen.jsx';
import PageHeader from '@shared/components/layout/PageHeader.jsx';
import StepIndicator from '@shared/components/layout/StepIndicator.jsx';
import Button from '@shared/components/ui/Button.jsx';
import Card from '@shared/components/ui/Card.jsx';
import FormField from '@shared/components/ui/FormField.jsx';
import IconButton from '@shared/components/ui/IconButton.jsx';
import PasswordField from '@shared/components/ui/PasswordField.jsx';
import TextField from '@shared/components/ui/TextField.jsx';

export default function LayoutSection() {
  const [preview, setPreview] = useState(false);

  return (
    <Section title="2e. Layout" note="Verdicts: colour, icon and word together. Over baseline is terracotta, never red.">
      <div className="gallery__grid">
        <Sample label="Verdict: all four">
          <div className="gallery__stack">
            <Verdict value="OVER" />
            <Verdict value="ON_TRACK" />
            <Verdict value="UNDER" />
            <Verdict value="NO_INCOME_SET" />
          </div>
        </Sample>
        <Sample label="Verdict with its own wording">
          <Verdict value="OVER" label="Above your usual" />
        </Sample>
        <Sample label="AppLogo (placeholder wordmark)">
          <Row>
            <AppLogo />
            <AppLogo size="lg" />
          </Row>
        </Sample>
        <Sample label="StepIndicator">
          <div className="gallery__stack">
            <StepIndicator current={1} total={2} />
            <StepIndicator current={2} total={2} />
          </div>
        </Sample>
        <Sample label="PageHeader with back and action">
          <Card>
            <PageHeader title="Reports" onBack={() => {}} action={<IconButton icon={Plus} label="Add" />} />
          </Card>
        </Sample>
        <Sample label="PageHeader, title only, long title">
          <Card>
            <PageHeader title="Settings and account preferences for this device" />
          </Card>
        </Sample>
        <Sample label="FormScreen (opens full screen)" wide>
          <Row><Button variant="secondary" onClick={() => setPreview(true)}>Open FormScreen preview</Button></Row>
        </Sample>
      </div>

      {preview && (
        <div className="gallery__fullscreen">
          <FormScreen
            step={<StepIndicator current={1} total={2} />}
            title="Create your account"
            description="Tell us who you are."
            onBack={() => setPreview(false)}
            onSubmit={() => setPreview(false)}
            footer={
              <>
                <Button type="submit" block>Continue</Button>
                <Button variant="ghost" block onClick={() => setPreview(false)}>Close preview</Button>
              </>
            }
          >
            <FormField label="First name">
              <TextField autoComplete="given-name" />
            </FormField>
            <FormField label="Middle name" optional>
              <TextField autoComplete="additional-name" />
            </FormField>
            <FormField label="Password" hint="At least 8 characters.">
              <PasswordField autoComplete="new-password" />
            </FormField>
          </FormScreen>
        </div>
      )}
    </Section>
  );
}
