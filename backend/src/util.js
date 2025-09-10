import crypto from 'crypto';
export function drawOutcome() {
  const n = crypto.randomInt(0, 2);
  return n === 0 ? 'Small' : 'Big';
}
export function roundId() {
  return crypto.randomBytes(6).toString('hex');
}
