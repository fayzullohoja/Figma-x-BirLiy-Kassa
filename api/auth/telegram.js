import { extractTelegramUser, verifyTelegramInitData } from '../_lib/telegram.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { initData } = req.body || {};
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN is not configured' });
    }

    const isValid = verifyTelegramInitData(initData, botToken);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid Telegram initData' });
    }

    const user = extractTelegramUser(initData);

    return res.status(200).json({
      ok: true,
      user,
      telegram_id: user?.id ?? null,
      verified_at: new Date().toISOString(),
      note: 'Attach telegram_id as a custom JWT claim for strict RLS.',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Auth verification failed', details: error.message });
  }
}
