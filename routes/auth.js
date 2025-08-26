import { Router } from 'express';
import { verifyTelegramInitData, devBypassEnabled } from '../verifyTelegram.js';

const router = Router();

router.post('/verify', (req, res) => {
  const { initData } = req.body || {};
  const ok =
    (devBypassEnabled() && process.env.NODE_ENV !== 'production') ||
    verifyTelegramInitData(initData, process.env.BOT_TOKEN);
  if (!ok) return res.status(401).json({ ok: false, error: 'invalid_init_data' });
  // Parse minimal user info from initData (optional)
  let user = null;
  try {
    const params = new URLSearchParams(initData);
    user = JSON.parse(params.get('user') || 'null');
  } catch {}
  res.json({ ok: true, user });
});

export default router;
