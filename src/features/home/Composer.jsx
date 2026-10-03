import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ArrowUp, Mic } from 'lucide-react';
import { invalidateEntryData } from '@core/data/queryClient.js';
import { ApiError } from '@core/http/httpClient.js';
import IconButton from '@shared/components/ui/IconButton.jsx';
import useNetwork, { OFFLINE_MESSAGE } from '@shared/hooks/useNetwork.js';
import TextField from '@shared/components/ui/TextField.jsx';
import { entriesApi, newClientRequestId } from './api/entriesApi.js';
import {
  BUSY_PLACEHOLDER,
  ENTRY_MAX_LENGTH,
  GATED_PLACEHOLDER,
  GENERIC_ERROR,
  LABELS,
  PLACEHOLDER,
} from './composerContent.js';

// The single input line, vertically centred on the screen (Guide 7.1). Typing shows a send icon in place of the mic, so
// only one action button shows. Sending calls POST /entries/capture. While the server reads the entry the field empties
// and says so in its placeholder; it is read-only rather than disabled, so the keyboard stays up and nothing moves or
// dims. If the entry is refused, the text comes back as typed with the server's reason underneath.
// While the day is gated (Guide 7.7, Step 9l) the field is locked with its own placeholder and the mic stays off. A 423
// from the server is never an error here: the shared mutation handler refreshes the gate state.
// Step 9d decides the mic. With no connection (Step 9n) the send icon is disabled and the hint says a connection is needed; the text stays as typed. TextField supplies the 16px text and the focus ring.
export default function Composer({ gated = false }) {
  const [text, setText] = useState('');
  const [hint, setHint] = useState('');
  const input = useRef(null);
  const { online } = useNetwork();
  // { text, id }: the request id belongs to the exact text it was sent with. A retry of the same text reuses it, so the
  // server returns the entry it already made instead of a second one. Different text always gets a fresh id.
  const attempt = useRef(null);

  const capture = useMutation({ mutationFn: entriesApi.capture });
  const busy = capture.isPending;
  const hasText = text.trim().length > 0;
  const placeholder = (busy && BUSY_PLACEHOLDER) || (gated && GATED_PLACEHOLDER) || PLACEHOLDER;
  const shownHint = online ? hint : OFFLINE_MESSAGE; // no connection: the entry stays as typed and nothing is queued (Guide 1.1a)

  const onChange = (event) => {
    setText(event.target.value);
    if (hint) setHint('');
  };

  const submit = async (event) => {
    event.preventDefault();
    const entry = text.trim();
    if (!entry || busy || gated || !online) return;

    if (attempt.current?.text !== entry) attempt.current = { text: entry, id: newClientRequestId() };
    setHint('');

    try {
      await capture.mutateAsync({ text: entry, clientRequestId: attempt.current.id });
      attempt.current = null;
      setText('');
      invalidateEntryData();
    } catch (error) {
      if (!(error instanceof ApiError)) setHint(GENERIC_ERROR);
      else if (!error.isGated) setHint(error.message);
    }
    input.current?.focus();
  };

  return (
    <form className="home__composer" autoComplete="off" aria-busy={busy} onSubmit={submit}>
      <TextField
        inputRef={input}
        aria-label={LABELS.input}
        placeholder={placeholder}
        enterKeyHint="send"
        maxLength={ENTRY_MAX_LENGTH}
        readOnly={busy}
        disabled={gated}
        value={busy ? '' : text}
        onChange={onChange}
        trailing={
          hasText && !busy && !gated ? (
            <IconButton icon={ArrowUp} type="submit" label={LABELS.send} disabled={!online} />
          ) : (
            <IconButton icon={Mic} label={LABELS.mic} disabled />
          )
        }
      />
      {shownHint && (
        <p className="home__hint" role="status">
          {shownHint}
        </p>
      )}
    </form>
  );
}
