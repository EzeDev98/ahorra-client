import { useState } from 'react';
import { Row, Section } from '../Section.jsx';
import AmountField from '@shared/components/ui/AmountField.jsx';
import BottomSheet from '@shared/components/ui/BottomSheet.jsx';
import Button from '@shared/components/ui/Button.jsx';
import DetailRow from '@shared/components/ui/DetailRow.jsx';
import Drawer from '@shared/components/ui/Drawer.jsx';
import FormField from '@shared/components/ui/FormField.jsx';
import Modal from '@shared/components/ui/Modal.jsx';
import Tag from '@shared/components/ui/Tag.jsx';
import TextField from '@shared/components/ui/TextField.jsx';
import Verdict from '@shared/components/feedback/Verdict.jsx';

export default function OverlaysSection() {
  const [open, setOpen] = useState(null);
  const [discard, setDiscard] = useState(false);
  const [amount, setAmount] = useState('2300');
  const close = () => setOpen(null);

  return (
    <Section
      title="2d. Overlays"
      note="Check: Escape closes only the top overlay, Tab stays inside, the page behind does not scroll, and focus returns to the button that opened it."
    >
      <Row>
        <Button variant="secondary" onClick={() => setOpen('modal')}>Modal</Button>
        <Button variant="secondary" onClick={() => setOpen('forced')}>Modal, not dismissible</Button>
        <Button variant="secondary" onClick={() => setOpen('sheet')}>Bottom sheet (with stacked modal)</Button>
        <Button variant="secondary" onClick={() => setOpen('drawer')}>Drawer</Button>
      </Row>

      <Modal
        open={open === 'modal'}
        onClose={close}
        title="Delete this entry?"
        footer={
          <>
            <Button variant="ghost" onClick={close}>Cancel</Button>
            <Button variant="danger" onClick={close}>Delete</Button>
          </>
        }
      >
        <p>This removes the entry from your pending list.</p>
      </Modal>

      <Modal
        open={open === 'forced'}
        onClose={close}
        dismissible={false}
        title="Confirm to continue"
        footer={<Button onClick={close}>Understood</Button>}
      >
        <p>No close button, and Escape and the scrim do nothing. Only the button closes it.</p>
      </Modal>

      <BottomSheet
        open={open === 'sheet'}
        onClose={close}
        title="Edit entry"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDiscard(true)}>Discard</Button>
            <Button onClick={close}>Confirm</Button>
          </>
        }
      >
        <div className="gallery__stack">
          <FormField label="Vendor">
            <TextField data-autofocus defaultValue="Shoprite" />
          </FormField>
          <FormField label="Amount">
            <AmountField value={amount} onChange={setAmount} />
          </FormField>
          {['Bread', 'Egg', 'Water', 'Rice', 'Oil', 'Salt', 'Sugar', 'Tea'].map((item) => (
            <DetailRow key={item} label={item}>₦500</DetailRow>
          ))}
        </div>
      </BottomSheet>

      <Modal
        open={discard}
        onClose={() => setDiscard(false)}
        title="Discard changes?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDiscard(false)}>Keep editing</Button>
            <Button
              variant="danger"
              onClick={() => {
                setDiscard(false);
                close();
              }}
            >
              Discard
            </Button>
          </>
        }
      >
        <p>This modal sits on top of the sheet. Escape should close this one first.</p>
      </Modal>

      <Drawer open={open === 'drawer'} onClose={close} footer={<Button variant="secondary" block>Sign out</Button>}>
        <div className="gallery__drawer-section">
          <p className="gallery__label">Today</p>
          <p className="gallery__t-total">₦3,000</p>
          <Verdict value="OVER" label="Above your usual" />
          <div><Tag>2 unconfirmed</Tag></div>
        </div>
        <div className="gallery__drawer-section">
          {['Reports', 'Insights', 'Behaviour', 'Settings'].map((item) => (
            <Button key={item} variant="ghost" block>{item}</Button>
          ))}
        </div>
      </Drawer>
    </Section>
  );
}
