// Jest tests for game logic
import { resolveBet } from '../src/game.js';

describe('resolveBet', () => {
  test('throws on invalid bet', () => {
    expect(() => resolveBet('Medium', 10)).toThrow();
  });
  test('throws on invalid amount', () => {
    expect(() => resolveBet('Big', 0)).toThrow();
    expect(() => resolveBet('Small', -5)).toThrow();
  });
  test('returns expected shape', () => {
    const r = resolveBet('Big', 10);
    expect(typeof r.roundId).toBe('string');
    expect(['Big','Small']).toContain(r.outcome);
    expect(typeof r.won).toBe('boolean');
    expect(typeof r.delta).toBe('number');
  });
});
