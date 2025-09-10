import { Router } from 'express';
import QRCode from 'qrcode';

export const upiRouter = Router();

/**
 * DEMO ONLY: generate a UPI QR code as data URL.
 * Example: /api/upi-qr?payee=demo@upi&name=Demo&amount=10&note=Test
 */
upiRouter.get('/upi-qr', async (req, res) => {
  try {
    const payee = String(req.query.payee || 'demo@upi').slice(0, 200);
    const name = String(req.query.name || 'Demo Payee').slice(0, 200);
    const amount = Number(req.query.amount || 0) || undefined;
    const note = String(req.query.note || 'DEMO').slice(0, 200);

    const params = new URLSearchParams({ pa: payee, pn: name, cu: 'INR' });
    if (amount) params.set('am', String(amount));
    if (note) params.set('tn', note);

    const upiUri = `upi://pay?${params.toString()}`;

    // Generate PNG Data URL (no watermark here; frontend overlays DEMO ribbon)
    const dataUrl = await QRCode.toDataURL(upiUri, { errorCorrectionLevel: 'H', margin: 2, width: 256 });

    res.json({
      upiUri,
      dataUrl,
      warning: 'DEMO ONLY — This endpoint does not process or confirm any payment. Do not use for gambling or real money.'
    });
  } catch (e) {
    res.status(400).json({ error: e?.message || 'Failed to generate QR' });
  }
});
