// If a 429 message says how long to wait ("... in 42 seconds"), returns that many milliseconds; otherwise fallbackMs.
export function cooldownFromMessage(message, fallbackMs) {
  const match = /(\d+)\s*(?:seconds?|secs?)\b/i.exec(message ?? '');
  return match ? Number(match[1]) * 1000 : fallbackMs;
}
