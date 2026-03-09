import { supabaseRequest } from '../../_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const transactionId = String(req.query.transactionId || '').trim();
  if (!transactionId) {
    return res.status(400).json({ error: 'transactionId is required' });
  }

  try {
    const rows = await supabaseRequest(
      'subscriptions',
      {
        query: `transaction_id=eq.${encodeURIComponent(transactionId)}&select=id,status,restaurant_id,amount,payment_method,end_date,created_at&limit=1`,
      }
    );

    const item = Array.isArray(rows) ? rows[0] : null;
    if (!item) {
      return res.status(404).json({ status: 'not_found' });
    }

    return res.status(200).json({
      status: item.status,
      subscription: item,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
