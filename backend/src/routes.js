import { Router } from 'express';
import { resolveBet } from './game.js';
import { ensureUser, setBalance, getBalance, addHistory, getHistory, addLedger, getLedger } from './balanceStore.js';
import { pickRandomUpi } from './upi.js';

const router = Router();

router.post('/register', (req, res) => {
  const name = (req.body?.name || 'Guest').trim().slice(0, 40);
  const userId = 'u_' + Math.random().toString(36).slice(2,10);
  ensureUser(userId); setBalance(userId, 1000);
  res.json({ userId, name, balance: 1000 });
});

router.get('/balance', (req, res) => {
  const userId = req.query.userId; if (!userId) return res.status(400).json({ error: 'userId required' });
  res.json({ userId, balance: getBalance(userId) });
});

router.get('/history', (req, res) => {
  const userId = req.query.userId; if (!userId) return res.status(400).json({ error: 'userId required' });
  res.json({ userId, history: getHistory(userId) });
});

router.post('/bet', (req, res) => {
  const { userId, bet, amount } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'userId required' });
  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ error: 'amount must be > 0' });
  const balance = getBalance(userId);
  if (amt > balance) return res.status(400).json({ error: 'insufficient balance' });
  try {
    const result = resolveBet(bet, amt);
    const newBalance = balance + result.delta; setBalance(userId, newBalance);
    const hist = addHistory(userId, { ts: new Date().toISOString(), roundId: result.roundId, bet, outcome: result.outcome, amount: amt, delta: result.delta, balanceAfter: newBalance });
    res.json({ ok: true, ...result, balance: newBalance, last10: hist.slice(0,10) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/withdraw', (req, res) => {
  const { userId, amount } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'userId required' });
  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ error: 'amount must be > 0' });
  const balance = getBalance(userId);
  if (amt > balance) return res.status(400).json({ error: 'insufficient balance' });
  const upi = pickRandomUpi();
  const newBalance = balance - amt; setBalance(userId, newBalance);
  const tx = { ts: new Date().toISOString(), type: 'mock_withdrawal', amount: amt, upi, status: 'SIMULATED_ONLY' };
  addLedger(userId, tx);
  res.json({ ok: true, message: 'Mock withdrawal recorded (no real payment sent).', upi, amount: amt, balance: newBalance });
});

router.get('/ledger', (req, res) => {
  const userId = req.query.userId; if (!userId) return res.status(400).json({ error: 'userId required' });
  res.json({ userId, ledger: getLedger(userId) });
});

export default router;
