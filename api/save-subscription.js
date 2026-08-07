// api/save-subscription.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const subscription = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription payload' });
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert([{ endpoint: subscription.endpoint, subscription }], { onConflict: 'endpoint' });

    if (error) {
      console.error('Supabase upsert error', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('save-subscription error', err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
}
