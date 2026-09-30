import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Row, Sample, Section } from '../Section.jsx';
import { flip, isReducedMotion, run, stagger } from '@core/motion/motion.js';
import Button from '@shared/components/ui/Button.jsx';
import Card from '@shared/components/ui/Card.jsx';

const ENTER = [{ opacity: 0, transform: 'translateY(-12px) scale(.98)' }, { opacity: 1, transform: 'none' }];

export default function MotionSection() {
  const boxRef = useRef(null);
  const staggerRef = useRef(null);
  const listRef = useRef(null);
  const nextId = useRef(3);
  const [items, setItems] = useState([
    { id: 1, text: 'Bread 500' },
    { id: 2, text: 'Bolt ride 2,300' },
    { id: 3, text: 'Airtime 1,000' },
  ]);

  const slideIn = () => run(boxRef.current, ENTER, { duration: 'base', ease: 'out' });

  const fly = () =>
    run(
      boxRef.current,
      [
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: 'translate(60px, -30px) scale(.5)', opacity: 0.85, offset: 0.5 },
        { transform: 'translate(120px, -60px) scale(.06)', opacity: 0.1 },
      ],
      { duration: 'fly', ease: 'standard' },
    );

  const shake = () =>
    run(
      boxRef.current,
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }],
      { duration: 'base', ease: 'standard' },
    );

  const staggerOut = () => {
    [...staggerRef.current.children].forEach((el, index) =>
      run(el, ENTER, { duration: 'fly', ease: 'out', delay: stagger(index), fill: 'backwards' }),
    );
  };

  const add = () => {
    nextId.current += 1;
    const item = { id: nextId.current, text: `Entry ${nextId.current}` };
    flip(listRef.current, () => flushSync(() => setItems((list) => [item, ...list])));
    run(listRef.current.firstElementChild, ENTER, { duration: 'base', ease: 'out' });
  };

  const remove = async (id, el) => {
    await run(el, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.97)' }], {
      duration: 'fast',
      ease: 'standard',
      fill: 'forwards',
    });
    flip(listRef.current, () => flushSync(() => setItems((list) => list.filter((entry) => entry.id !== id))));
  };

  return (
    <Section
      title="2f. Motion"
      note={`Reduced motion is currently ${isReducedMotion() ? 'ON: movement is replaced by a plain fade or nothing.' : 'OFF. Turn it on in your system settings and reload to check the fallback.'}`}
    >
      <div className="gallery__grid">
        <Sample label="run(): slide in, fly, shake">
          <Card className="gallery__box"><span ref={boxRef}>Animate me</span></Card>
          <Row>
            <Button variant="secondary" onClick={slideIn}>Slide in</Button>
            <Button variant="secondary" onClick={fly}>Fly</Button>
            <Button variant="secondary" onClick={shake}>Shake</Button>
          </Row>
        </Sample>
        <Sample label="stagger(): 70 ms apart">
          <div ref={staggerRef} className="gallery__stack">
            <Card>One</Card>
            <Card>Two</Card>
            <Card>Three</Card>
          </div>
          <Row><Button variant="secondary" onClick={staggerOut}>Stagger out</Button></Row>
        </Sample>
        <Sample label="flip(): siblings glide when one is added or removed" wide>
          <Row><Button variant="secondary" onClick={add}>Add an entry</Button></Row>
          <ul ref={listRef} className="gallery__items">
            {items.map((item) => (
              <Card as="li" key={item.id} className="gallery__item">
                <span>{item.text}</span>
                <Button variant="ghost" onClick={(event) => remove(item.id, event.currentTarget.closest('li'))}>
                  Confirm
                </Button>
              </Card>
            ))}
          </ul>
        </Sample>
      </div>
    </Section>
  );
}
