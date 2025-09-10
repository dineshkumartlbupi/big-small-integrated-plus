const store = new Map();
export function ensureUser(userId) {
  if (!store.has(userId)) store.set(userId, { balance: 0, history: [], ledger: [] });
  return store.get(userId);
}
export function setBalance(userId, amount) { ensureUser(userId).balance = amount; }
export function getBalance(userId) { return ensureUser(userId).balance; }
export function addHistory(userId, entry) {
  const u = ensureUser(userId); u.history.unshift(entry); if (u.history.length > 1000) u.history.pop(); return u.history;
}
export function getHistory(userId) { return ensureUser(userId).history; }
export function addLedger(userId, entry) {
  const u = ensureUser(userId); u.ledger.unshift(entry); if (u.ledger.length > 1000) u.ledger.pop(); return u.ledger;
}
export function getLedger(userId) { return ensureUser(userId).ledger; }
