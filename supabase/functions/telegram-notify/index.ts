import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/telegram';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const TELEGRAM_API_KEY = Deno.env.get('TELEGRAM_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY) {
      return new Response(JSON.stringify({ error: 'Telegram not connected' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sb = createClient(SUPABASE_URL, SERVICE_KEY);

    // Get chat_id from admin_settings
    const { data: settings } = await sb.from('admin_settings').select('value').eq('key', 'telegram_chat_id').maybeSingle();
    const chatId = settings?.value?.trim();

    const body = await req.json().catch(() => ({}));

    // Test mode
    if (body.test) {
      if (!chatId) return new Response(JSON.stringify({ error: 'No chat_id configured' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      const r = await sendTelegram(chatId, '✅ <b>Glamora notifications connected!</b>\n\nYou will now receive alerts here for new orders, reviews and signups.', LOVABLE_API_KEY, TELEGRAM_API_KEY);
      return new Response(JSON.stringify(r), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Direct send (called by trigger via pg_net)
    if (body.title) {
      if (!chatId) return new Response(JSON.stringify({ skipped: 'no chat_id' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      const text = `<b>${escapeHtml(body.title)}</b>\n${escapeHtml(body.message || '')}`;
      const r = await sendTelegram(chatId, text, LOVABLE_API_KEY, TELEGRAM_API_KEY);
      return new Response(JSON.stringify(r), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get last update to find chat_id (for setup helper)
    if (body.discover_chat_id) {
      const r = await fetch(`${GATEWAY_URL}/getUpdates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'X-Connection-Api-Key': TELEGRAM_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ limit: 10 }),
      });
      const data = await r.json();
      const chats = new Map<number, { id: number; name: string }>();
      for (const u of (data.result || [])) {
        const m = u.message || u.edited_message;
        if (m?.chat?.id) {
          chats.set(m.chat.id, {
            id: m.chat.id,
            name: m.chat.title || `${m.chat.first_name || ''} ${m.chat.last_name || ''}`.trim() || m.chat.username || 'Unknown',
          });
        }
      }
      return new Response(JSON.stringify({ chats: Array.from(chats.values()) }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

async function sendTelegram(chatId: string, text: string, lovableKey: string, tgKey: string) {
  const r = await fetch(`${GATEWAY_URL}/sendMessage`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${lovableKey}`,
      'X-Connection-Api-Key': tgKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
  const d = await r.json();
  if (!r.ok) return { error: d };
  return { sent: true, message_id: d.result?.message_id };
}

function escapeHtml(s: string) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}