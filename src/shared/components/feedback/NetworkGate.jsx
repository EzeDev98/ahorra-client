import useNetwork from '@shared/hooks/useNetwork.js';
import ConnectionRequired from './ConnectionRequired.jsx';

// Covers the app with the "needs a connection" screen while offline. The app underneath stays mounted
// (and is made inert), so the user comes back to exactly where they were, with nothing stored for later.
export default function NetworkGate({ children }) {
  const { online } = useNetwork();
  return (
    <>
      <div inert={!online}>{children}</div>
      {!online && <ConnectionRequired />}
    </>
  );
}
