import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VAPID_PUBLIC = 'BOxqT2CZMmzyTb7VCe0Me9jQJcNjfE8DExyedhyNRoKlOy5dsTc-IXWgk4eLGJR9Dfsz3x9JlGbyh3IOW9pNDI0';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY');
    if (!VAPID_PRIVATE) {
      return new Response(JSON.stringify({ error: 'VAPID_PRIVATE_KEY missing' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    webpush.setVapidDetails('mailto:admin@glamora.shop', VAPID_PUBLIC, VAPID_PRIVATE);

    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const body = await req.json().catch(() => ({}));
    const { title = '🔔 Glamora', message = '', type = 'info', link = '/admin/orders', test = false, endpoint } = body;

    // Test mode: send to a single endpoint or all
    let query = sb.from('push_subscriptions').select('*');
    if (endpoint) query = query.eq('endpoint', endpoint);
    const { data: subs, error } = await query;
    if (error) throw error;
    if (!subs?.length) {
      return new Response(JSON.stringify({ sent: 0, note: 'no subscriptions' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const payload = JSON.stringify({
      title: test ? '✅ Test Push — Glamora' : title,
      message: test ? 'Push notifications working! 🎉' : message,
      type, link, tag: type + '-' + Date.now(),
    });

    let sent = 0, failed = 0;
    const expired: string[] = [];
    await Promise.all(subs.map(async (s: any) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
          { TTL: 60 }
        );
        sent++;
      } catch (e: any) {
        failed++;
        if (e?.statusCode === 410 || e?.statusCode === 404) expired.push(s.endpoint);
      }
    }));

    if (expired.length) {
      await sb.from('push_subscriptions').delete().in('endpoint', expired);
    }

    return new Response(JSON.stringify({ sent, failed, cleaned: expired.length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});