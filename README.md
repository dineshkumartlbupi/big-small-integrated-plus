# Big/Small — Integrated Demo (Mock UPI QR • No Real Money)

**This is a demo only.** It adds a *UPI QR (DEMO)* generator for educational/testing purposes.
It does **not** move real money and must not be used for gambling.

## Run
```bash
cd backend
npm install
npm start
# open http://localhost:4000
```

## Extra Endpoint (DEMO)
- `GET /api/upi-qr?payee=demo@upi&name=Demo%20Payee&amount=10&note=Test`
  - Returns `{ upiUri, dataUrl, warning }` (PNG data URL). **DEMO ONLY**.

