import { httpClient } from '@core/http/httpClient.js';

export const voiceApi = {
  // POST /entries/transcribe
  // in:  multipart form with one field, audio: the recording (webm, mp4, ogg and similar, at most 2 MB, about a minute)
  // out: { text }  the words that were heard. Nothing is saved: the person reviews the text, then sends it as a normal
  //      entry with source VOICE. 400 empty, too large or not audio. 423 day gated.
  transcribe: (blob) => {
    const form = new FormData();
    form.append('audio', blob, 'entry');
    return httpClient.post('/entries/transcribe', form);
  },
};
