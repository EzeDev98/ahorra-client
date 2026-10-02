// The line above the input. Anchored to the input, not to the top of the screen, so the input never moves when the
// text changes. The subtitle slot keeps its height when empty, for the same reason. Step 9b supplies the words.
export default function Greeting({ title, subtitle }) {
  return (
    <div className="home__greeting">
      <p className="home__greeting-title">{title}</p>
      <p className="home__greeting-sub">{subtitle}</p>
    </div>
  );
}
