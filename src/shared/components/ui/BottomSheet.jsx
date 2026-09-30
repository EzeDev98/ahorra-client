import Overlay from './Overlay.jsx';

// Sheet that rises from the bottom, for the confirm-and-edit form. Same props as Modal.
export default function BottomSheet(props) {
  return <Overlay variant="sheet" {...props} />;
}
