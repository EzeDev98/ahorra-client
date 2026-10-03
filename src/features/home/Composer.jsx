import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ArrowUp, Mic, Square, X } from 'lucide-react';
import { invalidateEntryData } from '@core/data/queryClient.js';
import { ApiError } from '@core/http/httpClient.js';
import IconButton from '@shared/components/ui/IconButton.jsx';
import useNetwork, { OFFLINE_MESSAGE } from '@shared/hooks/useNetwork.js';
import TextField from '@shared/components/ui/TextField.jsx';
import { entriesApi, newClientRequestId } from './api/entriesApi.js';
import { voiceApi } from './api/voiceApi.js';
import {
  BUSY_PLACEHOLDER,
  ENTRY_MAX_LENGTH,
  GATED_PLACEHOLDER,
  GENERIC_ERROR,
  LABELS,
  PLACEHOLDER,
  VOICE,
} from './composerContent.js';
import useVoiceRecorder, { voiceSupported } from './useVoiceRecorder.js';

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
  const transcribe = useMutation({ mutationFn: voiceApi.transcribe });
  const transcribing = transcribe.isPending;
  const fromVoice = useRef(false); // the words in the box came from a recording, so the entry is sent with source VOICE

  // A finished recording is turned into text on the server and put in the box for the person to check (Step 18c).
  const listen = async (blob) => {
    try {
      const { text: heard } = await transcribe.mutateAsync(blob);
      fromVoice.current = true;
      attempt.current = null;
      setText(String(heard ?? '').slice(0, ENTRY_MAX_LENGTH));
      setHint(VOICE.review);
    } catch (error) {
      if (!(error instanceof ApiError)) setHint(GENERIC_ERROR);
      else if (!error.isGated) setHint(error.message);
    }
    input.current?.focus();
  };
  const recorder = useVoiceRecorder({ maxSeconds: VOICE.maxSeconds, onComplete: listen });
  const canListen = voiceSupported() && online && !gated && !busy && !transcribing;

  const startListening = async () => {
    setHint('');
    try {
      await recorder.start();
    } catch (error) {
      setHint(error?.name === 'NotAllowedError' || error?.name === 'SecurityError' ? VOICE.blocked : VOICE.failed);
    }
  };
  const hasText = text.trim().length > 0;
  const placeholder =
    (busy && BUSY_PLACEHOLDER) ||
    (transcribing && VOICE.transcribing) ||
    (recorder.recording && VOICE.listening) ||
    (gated && GATED_PLACEHOLDER) ||
    PLACEHOLDER;
  const shownHint = !online ? OFFLINE_MESSAGE : recorder.recording ? VOICE.listeningHint : hint; // no connection: the entry stays as typed and nothing is queued (Guide 1.1a)

  const onChange = (event) => {
    setText(event.target.value);
    if (!event.target.value) fromVoice.current = false;
    if (hint) setHint('');
  };

  const submit = async (event) => {
    event.preventDefault();
    const entry = text.trim();
    if (!entry || busy || gated || !online) return;

    if (attempt.current?.text !== entry) attempt.current = { text: entry, id: newClientRequestId() };
    setHint('');

    try {
      await capture.mutateAsync({
        text: entry,
        source: fromVoice.current ? 'VOICE' : 'TEXT',
        clientRequestId: attempt.current.id,
      });
      attempt.current = null;
      fromVoice.current = false;
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
        readOnly={busy || transcribing || recorder.recording}
        disabled={gated}
        value={busy ? '' : text}
        onChange={onChange}
        trailing={
          recorder.recording ? (
            <>
              <IconButton icon={X} type="button" label={VOICE.cancel} onClick={recorder.cancel} />
              <IconButton icon={Square} type="button" label={VOICE.stop} onClick={recorder.stop} />
            </>
          ) : hasText && !busy && !gated ? (
            <IconButton icon={ArrowUp} type="submit" label={LABELS.send} disabled={!online} />
          ) : (
            <IconButton
              icon={Mic}
              type="button"
              label={voiceSupported() ? LABELS.mic : VOICE.unavailable}
              onClick={startListening}
              disabled={!canListen}
            />
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
