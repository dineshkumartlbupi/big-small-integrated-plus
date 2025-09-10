import { drawOutcome, roundId } from './util.js';
export function resolveBet(bet, amount) {
  if (!['Big','Small'].includes(bet)) throw new Error('Invalid bet; expected "Big" or "Small".');
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Amount must be a positive number.');
  const outcome = drawOutcome();
  const won = outcome === bet;
  const delta = won ? amount : -amount;
  return { roundId: roundId(), outcome, won, delta };
}
