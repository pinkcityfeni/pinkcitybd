import { useEffect, useState } from 'react';
import { Bell, Send, MessageCircle, RefreshCw, Check, Smartphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { requestBrowserNotificationPermission } from '@/hooks/useNotifications';
import { usePushSubscription } from '@/hooks/usePushSubscription';

export default function Notifications() {
  const [chatId, setChatId] = useState('');
  const [saving, setSaving] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [discovered, setDiscovered] = useState<{ id: number; name: string }[]>([]);
  const [pushPerm, setPushPerm] = useState<NotificationPermission | 'unsupported'>('default');
  const push = usePushSubscription();
  const [testingPush, setTestingPush] = useState(false);

  useEffect(() => {
    if ('Notification' in window) setPushPerm(Notification.permission);
    else setPushPerm('unsupported');
    supabase.from('admin_settings').select('value').eq('key', 'telegram_chat_id').maybeSingle()
      .then(({ data }) => { if (data?.value) setChatId(data.value); });
  }, []);

  const saveChatId = async () => {
    setSaving(true);
    const { error } = await supabase.from('admin_settings').upsert({ key: 'telegram_chat_id', value: chatId.trim(), updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success('Telegram chat ID saved');
  };

  const sendTest = async () => {
    const { data, error } = await supabase.functions.invoke('telegram-notify', { body: { test: true } });
    if (error || data?.error) toast.error(`Test failed: ${data?.error?.description || data?.error || error?.message || 'Check chat ID'}`);
    else toast.success('✅ Test message sent! Check your Telegram.');
  };

  const discover = async () => {
    setDiscovering(true);
    const { data, error } = await supabase.functions.invoke('telegram-notify', { body: { discover_chat_id: true } });
    setDiscovering(false);
    if (error) { toast.error(error.message); return; }
    setDiscovered(data?.chats || []);
    if (!data?.chats?.length) toast.info('No chats found. Send any message to your bot first, then try again.');
  };

  const enablePush = async () => {
    const r = await requestBrowserNotificationPermission();
    setPushPerm(r as NotificationPermission);
    if (r === 'granted') toast.success('Browser notifications enabled');
    else if (r === 'denied') toast.error('Permission denied. Enable from browser site settings.');
  };

  const enablePhonePush = async () => {
    const r = await push.subscribe();
    if (r.ok) toast.success('📱 Phone push enabled! Notifications will arrive even when site is closed.');
    else toast.error(r.error || 'Failed to enable phone push');
  };

  const sendTestPush = async () => {
    setTestingPush(true);
    const { data, error } = await supabase.functions.invoke('send-push', { body: { test: true, endpoint: push.endpoint } });
    setTestingPush(false);
    if (error) toast.error(error.message);
    else if (data?.sent) toast.success(`✅ Test push sent! Check your device.`);
    else toast.error(data?.note || data?.error || 'No subscriptions found');
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold flex items-center gap-2"><Bell className="h-6 w-6 text-primary" /> Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">নতুন order, review, signup, advance payment হলে notification পাবেন।</p>
      </div>

      {/* Phone Push (Web Push) */}
      <Card className="p-5 space-y-4 rounded-2xl border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h2 className="font-semibold flex items-center gap-2"><Smartphone className="h-5 w-5 text-primary" /> 📱 Phone Push Notifications</h2>
            <p className="text-xs text-muted-foreground mt-1">Messenger এর মতো sound + vibration সহ phone-এ notification আসবে — site বন্ধ থাকলেও।</p>
          </div>
          {push.subscribed ? (
            <span className="text-xs px-3 py-1 rounded-full bg-success/10 text-success border border-success/20 flex items-center gap-1 shrink-0"><Check className="h-3 w-3" /> Active</span>
          ) : !push.supported ? (
            <span className="text-xs px-3 py-1 rounded-full bg-muted shrink-0">Not supported</span>
          ) : null}
        </div>

        <div className="bg-muted/50 rounded-xl p-3 text-xs space-y-1">
          <div className="font-medium">📲 Setup (one-time, 2 মিনিট):</div>
          <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
            <li>Phone Chrome/Safari এ এই site খুলুন</li>
            <li>Browser menu → "Add to Home Screen" → Glamora icon</li>
            <li>Home screen থেকে app খুলে এই page-এ এসে নিচের button চাপুন</li>
            <li>"Allow" দিন → Test push পাঠিয়ে confirm করুন ✅</li>
          </ol>
        </div>

        <div className="flex flex-wrap gap-2">
          {!push.subscribed ? (
            <Button onClick={enablePhonePush} disabled={push.loading || !push.supported} className="rounded-full">
              <Smartphone className="h-4 w-4 mr-1" /> Enable on this device
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={sendTestPush} disabled={testingPush} className="rounded-full">
                <Send className="h-3 w-3 mr-1" /> {testingPush ? 'Sending...' : 'Send test push'}
              </Button>
              <Button variant="ghost" size="sm" onClick={push.unsubscribe} disabled={push.loading} className="rounded-full text-destructive">
                Disable on this device
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Browser Push */}
      <Card className="p-5 space-y-3 rounded-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold flex items-center gap-2">🔔 Browser Notifications</h2>
            <p className="text-xs text-muted-foreground mt-1">Admin panel খোলা থাকলে browser-এ instant alert আসবে।</p>
          </div>
          {pushPerm === 'granted' ? (
            <span className="text-xs px-3 py-1 rounded-full bg-success/10 text-success border border-success/20 flex items-center gap-1"><Check className="h-3 w-3" /> Enabled</span>
          ) : pushPerm === 'unsupported' ? (
            <span className="text-xs px-3 py-1 rounded-full bg-muted">Not supported</span>
          ) : (
            <Button size="sm" onClick={enablePush} className="rounded-full">Enable</Button>
          )}
        </div>
      </Card>

      {/* Telegram */}
      <Card className="p-5 space-y-4 rounded-2xl">
        <div>
          <h2 className="font-semibold flex items-center gap-2"><MessageCircle className="h-5 w-5 text-[#0088cc]" /> Telegram Alerts</h2>
          <p className="text-xs text-muted-foreground mt-1">Telegram-এ instant message আসবে — phone বন্ধ থাকলেও notification আসবে।</p>
        </div>

        <div className="bg-muted/50 rounded-xl p-3 text-xs space-y-1">
          <div className="font-medium">Setup steps:</div>
          <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
            <li>Telegram-এ আপনার connected bot খুঁজে বের করুন (Connectors → Telegram দেখুন bot username)</li>
            <li>Bot-কে <code className="bg-background px-1 rounded">/start</code> পাঠান বা যেকোনো message দিন</li>
            <li>নিচে "Find my chat" চাপুন → আপনার chat select করুন</li>
            <li>"Send test" চাপে confirm করুন ✅</li>
          </ol>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Telegram Chat ID</label>
          <div className="flex gap-2">
            <Input value={chatId} onChange={e => setChatId(e.target.value)} placeholder="e.g. 123456789" className="rounded-full" />
            <Button onClick={saveChatId} disabled={saving || !chatId.trim()} className="rounded-full">Save</Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={discover} disabled={discovering} className="rounded-full">
            <RefreshCw className={`h-3 w-3 mr-1 ${discovering ? 'animate-spin' : ''}`} /> Find my chat
          </Button>
          <Button variant="outline" size="sm" onClick={sendTest} disabled={!chatId.trim()} className="rounded-full">
            <Send className="h-3 w-3 mr-1" /> Send test
          </Button>
        </div>

        {discovered.length > 0 && (
          <div className="space-y-1 border-t pt-3">
            <div className="text-xs font-medium">Found chats — click to use:</div>
            {discovered.map(c => (
              <button
                key={c.id}
                onClick={() => setChatId(String(c.id))}
                className="w-full text-left px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted text-sm flex justify-between items-center"
              >
                <span>{c.name}</span>
                <code className="text-xs text-muted-foreground">{c.id}</code>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5 rounded-2xl">
        <h2 className="font-semibold mb-2">📋 In-app Bell</h2>
        <p className="text-xs text-muted-foreground">Top-right bell icon-এ সব unread notification list দেখাবে। Realtime — page refresh লাগবে না।</p>
      </Card>
    </div>
  );
}