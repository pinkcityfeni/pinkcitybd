import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const VAPID_PUBLIC_KEY = 'BC2DKXgt1sYxAcyd_INyiMY9MbvowNUO63GJLIL1iljnQC7KCAh7Eo8UAy6YB15EcaRhPTJCwK5bfUPw8mQ6Y2Q';

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
  return btoa(s);
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
      setSubscribed(!!sub);
      setEndpoint(sub?.endpoint || null);
    } catch {
      setSubscribed(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const subscribe = useCallback(async () => {
    setLoading(true);
    try {
      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg) reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const perm = await Notification.requestPermission();
      if (perm !== 'granted') throw new Error('Notification permission denied');

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

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

      setSubscribed(true);
      setEndpoint(sub.endpoint);
      return { ok: true };
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