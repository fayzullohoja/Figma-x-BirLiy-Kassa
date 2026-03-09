import { addMonths } from 'date-fns';
import { getClickErrorResponse, verifyClickSignature } from '../../_lib/click.js';
import { supabaseRequest } from '../../_lib/supabase.js';

function parseAmountToInt(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.round(parsed);
}

function sumToTiyin(sumAmount) {
  return Math.round(sumAmount * 100);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = req.body || {};
  const clickSecret = process.env.CLICK_SECRET_KEY;

  if (!clickSecret) {
    return res.status(500).json(getClickErrorResponse(payload, -9, 'CLICK_SECRET_KEY is not configured'));
  }

  const valid = verifyClickSignature(payload, clickSecret);
  if (!valid) {
    return res.status(400).json(getClickErrorResponse(payload, -1, 'Invalid signature'));
  }

  if (Number(payload.error) !== 0) {
    return res.status(200).json(getClickErrorResponse(payload, Number(payload.error), payload.error_note || 'Click error'));
  }

  const action = Number(payload.action);
  const restaurantId = String(payload.transaction_param || '').trim();
  const transactionId = String(payload.merchant_trans_id || '').trim();

  if (!restaurantId || !transactionId) {
    return res.status(400).json(getClickErrorResponse(payload, -5, 'Missing transaction params'));
  }

  try {
    if (action === 0) {
      return res.status(200).json({
        click_trans_id: payload.click_trans_id,
        merchant_trans_id: payload.merchant_trans_id,
        merchant_prepare_id: payload.click_trans_id,
        error: 0,
        error_note: 'Success',
      });
    }

    if (action !== 1) {
      return res.status(400).json(getClickErrorResponse(payload, -3, 'Unsupported action'));
    }

    const restaurantRows = await supabaseRequest(
      'restaurants',
      {
        query: `id=eq.${encodeURIComponent(restaurantId)}&select=id,subscription_end_date&limit=1`,
      }
    );

    const restaurant = Array.isArray(restaurantRows) ? restaurantRows[0] : null;
    if (!restaurant) {
      return res.status(404).json(getClickErrorResponse(payload, -5, 'Restaurant not found'));
    }

    const currentEndDate = new Date(restaurant.subscription_end_date);
    const baseDate = currentEndDate > new Date() ? currentEndDate : new Date();
    const nextEndDate = addMonths(baseDate, 1);
    const amount = sumToTiyin(parseAmountToInt(payload.amount));

    await Promise.all([
      supabaseRequest('subscriptions', {
        method: 'POST',
        body: {
          restaurant_id: restaurantId,
          amount,
          payment_method: 'Click',
          transaction_id: transactionId,
          status: 'success',
          months: 1,
          start_date: new Date().toISOString().slice(0, 10),
          end_date: nextEndDate.toISOString().slice(0, 10),
        },
      }),
      supabaseRequest('restaurants', {
        method: 'PATCH',
        query: `id=eq.${encodeURIComponent(restaurantId)}`,
        body: {
          subscription_end_date: nextEndDate.toISOString(),
        },
      }),
    ]);

    return res.status(200).json({
      click_trans_id: payload.click_trans_id,
      merchant_trans_id: payload.merchant_trans_id,
      merchant_prepare_id: payload.click_trans_id,
      error: 0,
      error_note: 'Success',
    });
  } catch (error) {
    return res.status(500).json(getClickErrorResponse(payload, -9, error.message));
  }
}
