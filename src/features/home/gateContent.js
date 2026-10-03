// All gate copy lives here (Guide 7.7), so changing a word never means touching the logic.
export const GATE_COPY = {
  // time: a friendly clock time such as "10 pm". Without one the note still reads naturally.
  hardGate: (time) => `It is past ${time ?? 'the daily cut-off'}. Confirm your pending entries to continue.`,

  // when: "yesterday", "Monday" or "28 September". more: how many further days are waiting after that one.
  suspendedDay: (when, more) =>
    `Entries from ${when} are still pending. Confirm them to continue.${more > 0 ? ` ${more} more ${more === 1 ? 'day' : 'days'} to go after that.` : ''}`,

  // A gate reason this app does not know yet still locks Home, with plain words.
  generic: 'Confirm your pending entries to continue.',
};
