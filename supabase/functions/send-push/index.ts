import { createClient } from 'npm:@supabase/supabase-js@2';
import * as webpush from 'jsr:@negrel/webpush@0.5.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VAPID_PUBLIC = 'BEePjvU1Ppgf2mM9wGgl7ppFxXANFQG6XkMbY5m9rsiyJ_LYOHx--W6sfhxRlI8nWsXVrcvfy4_RSwVZJPaiN78';

function b64uToBytes(s: string): Uint8Array {
  const pad = '='.repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
function bytesToB64u(b: Uint8Array): string {
  let s = '';
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function buildVapidJwk(publicB64u: string, privateB64u: string) {
  const pub = b64uToBytes(publicB64u);
  if (pub.length !== 65 || pub[0] !== 0x04) throw new Error('Invalid VAPID public key');
  const x = bytesToB64u(pub.slice(1, 33));
  const y = bytesToB64u(pub.slice(33, 65));
  const priv = b64uToBytes(privateB64u);
  const scalar = priv.length === 32 ? priv : priv.length === 33 && priv[0] === 0x04 ? priv.slice(1) : priv.length === 65 && priv[0] === 0x04 ? priv.slice(33, 65) : null;
  if (!scalar) throw new Error('Invalid VAPID private key (got ' + priv.length + ' bytes)');
  const d = bytesToB64u(scalar);
  return {
    publicKey: { kty: 'EC', crv: 'P-256', x, y, key_ops: ['verify'] },
    privateKey: { kty: 'EC', crv: 'P-256', x, y, d, key_ops: ['sign'] },
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY');
    if (!VAPID_PRIVATE) {
      return new Response(JSON.stringify({ error: 'VAPID_PRIVATE_KEY missing' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const exported = buildVapidJwk(VAPID_PUBLIC, VAPID_PRIVATE.trim());
    const vapidKeys = await webpush.importVapidKeys(exported as any, { extractable: false });
    const appServer = await webpush.ApplicationServer.new({
      contactInformation: 'mailto:admin@glamora.shop',
      vapidKeys,
    });

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
    const errors: string[] = [];
    await Promise.all(subs.map(async (s: any) => {
      try {
        const subscriber = appServer.subscribe({
          endpoint: s.endpoint,
          keys: { p256dh: s.p256dh, auth: s.auth },
        });
        await subscriber.pushTextMessage(payload, { ttl: 60 });
        sent++;
      } catch (e: any) {
        failed++;
        const msg = String(e?.message || e);
        errors.push(msg.slice(0, 300));
        console.error('push send failed', { endpoint: String(s.endpoint).slice(0, 80), message: msg, status: e?.status, name: e?.name });
        if (msg.includes('410') || msg.includes('404') || msg.includes('403') || msg.toLowerCase().includes('gone') || msg.toLowerCase().includes('forbidden')) expired.push(s.endpoint);
      }
    }));

    if (expired.length) {
      await sb.from('push_subscriptions').delete().in('endpoint', expired);
    }

    return new Response(JSON.stringify({ sent, failed, cleaned: expired.length, firstError: test ? errors[0] : undefined, note: !sent && failed ? 'Subscription expired. Enable on this device again.' : undefined }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});