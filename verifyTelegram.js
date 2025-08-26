import crypto from 'crypto';

export function verifyTelegramInitData(initData, botToken) {
  try {
    if (!initData) return false;
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    const dataCheckString = [...urlParams.entries()]
      .sort(([a],[b]) => a.localeCompare(b))
      .map(([k,v]) => `${k}=${v}`)
      .join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calcHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    const a = Buffer.from(calcHash, 'hex');
    const b = Buffer.from(hash, 'hex');

    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch (e) {
    return false;
  }
}

export function devBypassEnabled() {
  return process.env.ALLOW_DEBUG_NO_INITDATA === 'true';
}
