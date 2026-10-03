import { useCallback, useEffect, useRef, useState } from 'react';

// Records the microphone with MediaRecorder (Step 18c). It holds the audio in memory only, and hands one Blob to
// onComplete when recording ends, by stop() or when maxSeconds is reached. cancel() throws the recording away.
//   recording   true from the moment the microphone is open until it is released.
//   start()     asks for the microphone (the browser's permission question appears here, so call it from a tap) and
//               starts recording. Rejects when the microphone cannot be used; error.name is 'NotAllowedError' when the
//               person said no.
// The first type the browser can record is used: Chrome and Android give webm, Safari gives mp4.
const TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];

const pickType = () => TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? '';

export const voiceSupported = () =>
  typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== 'undefined';

export default function useVoiceRecorder({ maxSeconds, onComplete }) {
  const [recording, setRecording] = useState(false);
  const recorder = useRef(null);
  const chunks = useRef([]);
  const timer = useRef(null);
  const discard = useRef(false);
  const complete = useRef(onComplete);

  useEffect(() => {
    complete.current = onComplete;
  }, [onComplete]);

  const stop = useCallback(() => {
    if (recorder.current?.state === 'recording') recorder.current.stop();
  }, []);

  const cancel = useCallback(() => {
    discard.current = true;
    stop();
  }, [stop]);

  const start = useCallback(async () => {
    const media = await navigator.mediaDevices.getUserMedia({ audio: true });
    const type = pickType();
    const rec = type ? new MediaRecorder(media, { mimeType: type }) : new MediaRecorder(media);
    chunks.current = [];
    discard.current = false;

    rec.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.current.push(event.data);
    };
    rec.onstop = () => {
      clearTimeout(timer.current);
      media.getTracks().forEach((track) => track.stop());
      recorder.current = null;
      setRecording(false);
      if (!discard.current && chunks.current.length > 0) {
        complete.current(new Blob(chunks.current, { type: rec.mimeType || type || 'audio/webm' }));
      }
      chunks.current = [];
    };

    rec.start();
    recorder.current = rec;
    setRecording(true);
    timer.current = setTimeout(() => {
      if (rec.state === 'recording') rec.stop();
    }, maxSeconds * 1000);
  }, [maxSeconds]);

  // Leaving the screen releases the microphone and drops whatever was recorded.
  useEffect(
    () => () => {
      discard.current = true;
      clearTimeout(timer.current);
      if (recorder.current?.state === 'recording') recorder.current.stop();
    },
    [],
  );

  return { recording, start, stop, cancel };
}
