import { useEffect, useState } from 'react';
import { Send, MessageCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function Notifications() {
  const [chatId, setChatId] = useState('');
  const [saving, setSaving] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [discovered, setDiscovered] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
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

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-[#0088cc]" /> Telegram Notifications
        </h1>
        <p className="text-sm text-muted-foreground mt-1">New order, review, signup, advance payment If Telegram-In alert Will come।</p>
      </div>

      <Card className="p-5 space-y-4 rounded-2xl">
        <div className="bg-muted/50 rounded-xl p-3 text-xs space-y-1">
          <div className="font-medium">Setup steps:</div>
          <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
            <li>Telegram-In your connected bot Find out</li>
            <li>Bot-To <code className="bg-background px-1 rounded">/start</code> Send or any message Day</li>
            <li>Below "Find my chat" Tap → Your chat select Do</li>
            <li>"Send test" To press confirm Do ✅</li>
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
    </div>
  );
}
