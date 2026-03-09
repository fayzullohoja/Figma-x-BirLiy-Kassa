import crypto from 'crypto';

export function verifyClickSignature(payload, secretKey) {
  const signString = [
    payload.click_trans_id,
    payload.service_id,
    secretKey,
    payload.merchant_trans_id,
    payload.amount,
    payload.action,
    payload.sign_time,
  ].join('');

  const hash = crypto
    .createHash('md5')
    .update(signString)
    .digest('hex');

  return hash === payload.sign_string;
}

export function getClickErrorResponse(payload, error, error_note) {
  return {
    click_trans_id: payload.click_trans_id,
    merchant_trans_id: payload.merchant_trans_id,
    merchant_prepare_id: payload.merchant_prepare_id || null,
    error,
    error_note,
  };
}
