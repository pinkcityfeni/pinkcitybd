import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  metadata: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
}

const TYPE_SOUND: Record<string, string> = {
  order: '🛒',
  advance_paid: '💸',
  review: '⭐',
  signup: '👤',
};

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 880; o.type = 'sine';
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o.start(); o.stop(ctx.currentTime + 0.42);
  } catch {}
}

export function useNotifications() {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setItems((data || []) as AdminNotification[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const ch = supabase
      .channel('admin-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        const n = payload.new as AdminNotification;
        setItems(prev => [n, ...prev].slice(0, 50));
        playBeep();
        const emoji = TYPE_SOUND[n.type] || '🔔';
        if ('Notification' in window && Notification.permission === 'granted') {
          try { new Notification(`${emoji} ${n.title}`, { body: n.message, tag: n.id }); } catch {}
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const unread = items.filter(i => !i.read).length;

  const markAllRead = async () => {
    const ids = items.filter(i => !i.read).map(i => i.id);
    if (!ids.length) return;
    await supabase.from('notifications').update({ read: true }).in('id', ids);
    setItems(prev => prev.map(i => ({ ...i, read: true })));
  };

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, read: true } : i));
  };

  const remove = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  return { items, unread, loading, markAllRead, markRead, remove, reload: load };
}

export function requestBrowserNotificationPermission() {
  if (!('Notification' in window)) return Promise.resolve('unsupported' as const);
  if (Notification.permission === 'granted') return Promise.resolve('granted' as const);
  if (Notification.permission === 'denied') return Promise.resolve('denied' as const);
  return Notification.requestPermission();
}