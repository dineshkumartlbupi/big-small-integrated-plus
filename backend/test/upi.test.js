// Jest tests for mock UPI picker (not the QR route)
import { getUpiList, pickRandomUpi } from '../src/upi.js';

describe('UPI mock', () => {
  test('getUpiList returns non-empty array', () => {
    const list = getUpiList();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
  });
  test('pickRandomUpi returns a value from list', () => {
    const list = getUpiList();
    const v = pickRandomUpi();
    expect(list).toContain(v);
  });
});
