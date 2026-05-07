import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const VAPID_PUBLIC_KEY = 'BOxqT2CZMmzyTb7VCe0Me9jQJcNjfE8DExyedhyNRoKlOy5dsTc-IXWgk4eLGJR9Dfsz3x9JlGbyh3IOW9pNDI0';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function bufToB64(buf: ArrayBuffer | null) {
  if (!buf) return '';
  const bytes = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.byteLength; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function saveSubscription(sub: PushSubscription) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const json = sub.toJSON();
  const { error } = await supabase.from('push_subscriptions').upsert({
    user_id: user.id,
    endpoint: sub.endpoint,
    p256dh: json.keys?.p256dh || bufToB64(sub.getKey('p256dh')),
    auth: json.keys?.auth || bufToB64(sub.getKey('auth')),
    user_agent: navigator.userAgent.slice(0, 200),
    last_used_at: new Date().toISOString(),
  }, { onConflict: 'endpoint' });
  if (error) throw error;
  return sub.endpoint;
}

export function usePushSubscription() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [endpoint, setEndpoint] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setSupported(false);
      return;
    }
    setSupported(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        const savedEndpoint = await saveSubscription(sub);
        setSubscribed(true);
        setEndpoint(savedEndpoint);
      } else {
        setSubscribed(false);
        setEndpoint(null);
      }
    } catch {
      setSubscribed(false);
      setEndpoint(null);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const subscribe = useCallback(async () => {
    setLoading(true);
    try {
      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg) await navigator.serviceWorker.register('/sw.js');
      reg = await navigator.serviceWorker.ready;

      const perm = await Notification.requestPermission();
      if (perm !== 'granted') throw new Error('Notification permission denied');

      let sub = await reg.pushManager.getSubscription();
      const existingKey = sub?.options.applicationServerKey ? bufToB64(sub.options.applicationServerKey) : null;
      if (sub && existingKey && existingKey !== VAPID_PUBLIC_KEY) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        await sub.unsubscribe();
        sub = null;
      }
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      const savedEndpoint = await saveSubscription(sub);

      setSubscribed(true);
      setEndpoint(savedEndpoint);
      return { ok: true, endpoint: savedEndpoint };
    } catch (e: any) {
      return { ok: false, error: e.message || String(e) };
    } finally {
      setLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        await sub.unsubscribe();
      }
      setSubscribed(false);
      setEndpoint(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { supported, subscribed, loading, endpoint, subscribe, unsubscribe, refresh };
}