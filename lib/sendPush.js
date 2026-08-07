// lib/sendPush.js
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_CONTACT_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * payload: { title, body, data } where data can include { url }
 */
export async function sendPushToAllMods(payload) {
  const { data: rows, error } = await supabase
    .from('push_subscriptions')
    .select('subscription');

  if (error) {
    console.error('Failed to fetch subscriptions', error);
    throw error;
  }

  const promises = (rows || []).map(r => {
    const sub = r.subscription;
    return webpush.sendNotification(sub, JSON.stringify(payload)).catch(async err => {
      // remove expired/invalid subscriptions
      if (err && (err.statusCode === 410 || err.statusCode === 404)) {
        try {
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        } catch (delErr) {
          console.error('Failed to delete expired subscription', delErr);
        }
      } else {
        console.error('web-push error', err);
      }
    });
  });

  await Promise.all(promises);
}
