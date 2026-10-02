import { Bell, Menu } from 'lucide-react';
import './Home.css';
import IconButton from '@shared/components/ui/IconButton.jsx';
import Composer from './Composer.jsx';
import Greeting from './Greeting.jsx';
import PendingStack from './PendingStack.jsx';
import useGreeting from './useGreeting.js';
import usePendingEntries from './usePendingEntries.js';

// Route "/home". The core screen (Guide 7). It does not use ScreenContainer: the input line sits at the vertical centre
// of the stage, the greeting is anchored above it and the cards below it, so nothing that appears later can move the input.
// Built in steps: 9a this skeleton, 9b the greeting words, 9c the composer, 9e to 9l the cards, the bell and the gate,
// 9m the side panel.
export default function Home() {
  const { title, subtitle } = useGreeting();
  const entries = usePendingEntries();

  return (
    <div className="home">
      <header className="home__bar">
        <IconButton icon={Menu} label="Open menu" />
        <IconButton icon={Bell} label="Nothing waiting" />
      </header>
      <main className="home__stage">
        <Greeting title={title} subtitle={subtitle} />
        <Composer />
        <PendingStack entries={entries} />
      </main>
    </div>
  );
}
