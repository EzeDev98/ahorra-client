// A heading over a block of the Behaviour screen.
export default function Section({ heading, children }) {
  return (
    <section>
      <h2 className="behavior__heading">{heading}</h2>
      {children}
    </section>
  );
}
