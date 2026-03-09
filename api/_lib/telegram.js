import crypto from 'crypto';

export function parseInitData(initData) {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  params.delete('hash');

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  return { hash, dataCheckString, params };
}

export function verifyTelegramInitData(initData, botToken) {
  if (!initData || !botToken) {
    return false;
  }

  const { hash, dataCheckString } = parseInitData(initData);
  if (!hash) {
    return false;
  }

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return calculatedHash === hash;
}

export function extractTelegramUser(initData) {
  const params = new URLSearchParams(initData);
  const userRaw = params.get('user');

  if (!userRaw) {
    return null;
  }

  try {
    return JSON.parse(userRaw);
  } catch {
    return null;
  }
}
