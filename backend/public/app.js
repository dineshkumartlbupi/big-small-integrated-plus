const API_BASE = `${location.origin}/api`;

const els = {
  registerCard: document.getElementById('register-card'),
  statusCard: document.getElementById('status-card'),
  historyCard: document.getElementById('history-card'),
  ledgerCard: document.getElementById('ledger-card'),
  name: document.getElementById('name'),
  btnRegister: document.getElementById('btn-register'),
  registerMsg: document.getElementById('register-msg'),

  amount: document.getElementById('amount'),
  betSmall: document.getElementById('bet-small'),
  betBig: document.getElementById('bet-big'),
  withdrawAmount: document.getElementById('withdraw-amount'),
  btnWithdraw: document.getElementById('btn-withdraw'),
  actionMsg: document.getElementById('action-msg'),

  balance: document.getElementById('balance'),
  histBody: document.getElementById('history-body'),
  ledgerBody: document.getElementById('ledger-body'),

  qrPayee: document.getElementById('qr-payee'),
  qrName: document.getElementById('qr-name'),
  qrAmount: document.getElementById('qr-amount'),
  qrNote: document.getElementById('qr-note'),
  btnQr: document.getElementById('btn-qr'),
  qrWrap: document.getElementById('qr-wrap'),
  qrImg: document.getElementById('qr-img'),
  qrUri: document.getElementById('qr-uri'),
};

function saveUserId(id) { localStorage.setItem('bs_userId', id); }
function getUserId() { return localStorage.getItem('bs_userId'); }

async function api(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'API error');
  return data;
}

async function refresh() {
  const userId = getUserId();
  if (!userId) return;
  try { const bal = await api(`/balance?userId=${encodeURIComponent(userId)}`); els.balance.textContent = bal.balance; } catch {}
  try { const hist = await api(`/history?userId=${encodeURIComponent(userId)}`); renderHistory(hist.history || []); } catch {}
  try { const led = await api(`/ledger?userId=${encodeURIComponent(userId)}`); renderLedger(led.ledger || []); } catch {}
}

function renderHistory(items) {
  els.historyCard.hidden = false;
  const rows = items.slice(0, 20).map(item => {
    const cls = item.delta >= 0 ? 'win' : 'loss';
    const delta = (item.delta >= 0 ? '+' : '') + item.delta;
    return `<tr>
      <td>${new Date(item.ts).toLocaleString()}</td>
      <td>${item.roundId}</td>
      <td>${item.bet}</td>
      <td>${item.outcome}</td>
      <td class="${cls}">${delta}</td>
      <td>${item.balanceAfter}</td>
    </tr>`;
  }).join('');
  els.histBody.innerHTML = rows || '<tr><td colspan="6">No rounds yet.</td></tr>';
}

function renderLedger(items) {
  els.ledgerCard.hidden = false;
  const rows = items.slice(0, 20).map(item => {
    return `<tr>
      <td>${new Date(item.ts).toLocaleString()}</td>
      <td>${item.type}</td>
      <td>${item.amount}</td>
      <td>${item.upi || '-'}</td>
      <td>${item.status}</td>
    </tr>`;
  }).join('');
  els.ledgerBody.innerHTML = rows || '<tr><td colspan="5">No ledger entries.</td></tr>';
}

async function ensureUser() {
  const userId = getUserId();
  if (!userId) {
    els.registerCard.hidden = false; els.statusCard.hidden = true;
  } else {
    els.registerCard.hidden = true; els.statusCard.hidden = false;
    await refresh();
  }
}

els.btnRegister.addEventListener('click', async () => {
  try {
    const name = els.name.value.trim();
    const result = await api('/register', { method: 'POST', body: JSON.stringify({ name }) });
    saveUserId(result.userId);
    els.registerMsg.textContent = `Registered as ${result.name} (userId: ${result.userId}).`;
    els.registerCard.hidden = true; els.statusCard.hidden = false;
    await refresh();
  } catch (e) { els.registerMsg.textContent = e.message; }
});

els.betSmall.addEventListener('click', async () => { await placeBet('Small'); });
els.betBig.addEventListener('click', async () => { await placeBet('Big'); });
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 's') els.betSmall.click();
  if (e.key.toLowerCase() === 'b') els.betBig.click();
});

async function placeBet(bet) {
  const userId = getUserId();
  const amount = Number(els.amount.value);
  if (!userId) return alert('Please register first.');
  if (!Number.isFinite(amount) || amount <= 0) return alert('Enter a valid amount.');
  els.actionMsg.textContent = 'Placing bet...';
  try {
    const result = await api('/bet', { method: 'POST', body: JSON.stringify({ userId, bet, amount }) });
    els.actionMsg.textContent = `Outcome: ${result.outcome}. ${result.won ? 'You WON!' : 'You lost.'} New balance: ${result.balance}`;
    els.balance.textContent = result.balance;
    renderHistory(result.last10 || []);
  } catch (e) { els.actionMsg.textContent = e.message; }
}

els.btnWithdraw.addEventListener('click', async () => {
  const userId = getUserId();
  const amount = Number(els.withdrawAmount.value);
  if (!userId) return alert('Please register first.');
  if (!Number.isFinite(amount) || amount <= 0) return alert('Enter a valid amount.');
  els.actionMsg.textContent = 'Creating mock payout...';
  try {
    const result = await api('/withdraw', { method: 'POST', body: JSON.stringify({ userId, amount }) });
    els.actionMsg.textContent = `${result.message} Mock transfer to: ${result.upi}. Balance: ${result.balance}`;
    els.balance.textContent = result.balance;
    await refresh();
  } catch (e) { els.actionMsg.textContent = e.message; }
});

// DEMO QR
els.btnQr.addEventListener('click', async () => {
  try {
    const p = new URLSearchParams();
    if (els.qrPayee.value.trim()) p.set('payee', els.qrPayee.value.trim());
    if (els.qrName.value.trim()) p.set('name', els.qrName.value.trim());
    if (Number(els.qrAmount.value)) p.set('amount', Number(els.qrAmount.value));
    if (els.qrNote.value.trim()) p.set('note', els.qrNote.value.trim());
    const data = await api(`/upi-qr?${p.toString()}`);
    els.qrImg.src = data.dataUrl;
    els.qrUri.textContent = data.upiUri + '  —  ' + data.warning;
    els.qrWrap.hidden = false;
  } catch (e) {
    alert(e.message);
  }
});

ensureUser();
