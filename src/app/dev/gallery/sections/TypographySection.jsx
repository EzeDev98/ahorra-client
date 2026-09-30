import { Sample, Section } from '../Section.jsx';

const SCALE = [
  ['xs', '12 / 16'],
  ['sm', '14 / 20'],
  ['md', '16 / 24'],
  ['lg', '20 / 28'],
  ['total', '24 / 32'],
];

const SWATCHES = [
  ['brand', '--color-brand'],
  ['text', '--color-text'],
  ['muted', '--color-text-muted'],
  ['line', '--color-line'],
  ['field line', '--color-field-line'],
  ['under', '--color-under'],
  ['on track', '--color-on-track'],
  ['over', '--color-over'],
  ['error', '--color-error'],
];

export default function TypographySection() {
  return (
    <Section
      title="Type, weight and colour checks"
      note="Look at the naira sign and the Yoruba letters: they use the fallback font (Guide §4.1). Decide whether to keep it."
    >
      <div className="gallery__grid">
        <Sample label="Type scale with amounts">
          <div className="gallery__stack">
            {SCALE.map(([name, size]) => (
              <p key={name} className={`gallery__t-${name}`}>
                text-{name} ({size}) ₦1,500,000.50 · ₦0 · ₦500
              </p>
            ))}
          </div>
        </Sample>
        <Sample label="Yoruba letters with a dot below">
          <p className="gallery__t-md">Ọlá, Ṣeun, Ẹbun, Ọmọ</p>
        </Sample>
        <Sample label="All weight 400: heading, strong, b, th">
          <div className="gallery__stack">
            <h3 className="gallery__t-md">A heading</h3>
            <p className="gallery__t-sm"><strong>Strong text</strong> and <b>bold tag</b></p>
            <table className="gallery__table gallery__t-sm">
              <thead>
                <tr><th>Category</th><th>Amount</th></tr>
              </thead>
              <tbody>
                <tr><td>Food</td><td>₦3,000</td></tr>
              </tbody>
            </table>
          </div>
        </Sample>
        <Sample label="Colour tokens">
          <div className="gallery__stack">
            {SWATCHES.map(([label, token]) => (
              <div key={token} className="gallery__row">
                <span className="gallery__swatch" style={{ '--swatch': `var(${token})` }} />
                <span className="gallery__t-sm">{label}</span>
              </div>
            ))}
          </div>
        </Sample>
      </div>
    </Section>
  );
}
