# Web Push Notifications for Admin

## Goal
Order/review/advance-payment আসলে admin এর phone/desktop এ Messenger-style notification আসবে — sound, vibration, lock screen এ — even website বন্ধ থাকলেও।

## How it works (simple)

```
Customer order → DB trigger → Edge function → Push service (Google/Apple)
                                                    ↓
                              📱 Admin phone "ding!" 🔔
```

Browser-এ একবার "Allow notifications" দিলেই হবে। Phone home screen-এ Glamora app icon save করলে native app এর মতো feel আসবে।

## What I'll build

### 1. PWA setup (phone-এ install করা যাবে)
- `public/manifest.json` update — Glamora branding, icons, theme color
- `public/sw.js` — service worker যেটা background-এ push receive করবে
- App register করার code `main.tsx`-এ

### 2. Push subscription system
- নতুন table `push_subscriptions` — admin/cashier-এর device tokens store হবে
- Admin Notifications page-এ button: "📱 Enable Phone Notifications"
- Click করলে browser permission চাইবে → subscription save হবে
- প্রতি device আলাদা register হবে (phone + desktop দুটোই কাজ করবে)

### 3. Push sender (edge function)
- নতুন function `send-push` — VAPID keys দিয়ে push পাঠাবে
- existing `forward_notification_to_telegram` trigger-এ একই সাথে এটাও call হবে
- Notification payload-এ থাকবে: emoji + title, body, click URL, sound flag

### 4. Service worker behavior
- Push আসলে: notification show + custom sound play (`/notification.mp3`)
- Click করলে: admin orders page খুলবে
- Vibration pattern (Messenger style): [200, 100, 200]

### 5. Admin UI updates
- Notifications page-এ নতুন card: "📱 Phone Push Notifications"
- Status badge: Enabled/Disabled per device
- Test button: "Send test push"
- "Disable on this device" option

## Setup steps for you (one-time, 2 মিনিট)

1. **Allow** চাপবেন যখন browser permission চাইবে
2. Phone Chrome-এ site খুলে → menu → "Add to Home Screen" → Glamora icon চলে আসবে
3. Test push পাঠিয়ে confirm করবেন
4. ব্যাস! এরপর order এলেই phone "ding" 🔔

## Technical details

**VAPID keys**: Edge function-এ generate করব, public key client-এ যাবে, private key secret হিসেবে থাকবে। কোনো paid service লাগবে না — Google/Apple এর free push servers ব্যবহার হবে।

**Library**: `web-push` (Deno-compatible) for sending, browser native `PushManager` API for subscribing।

**iOS support**: iOS 16.4+ Safari supports web push, কিন্তু site টা home screen-এ add করতেই হবে (PWA mode)। Android Chrome সব version-এ কাজ করে directly।

**Notification sound**: Default system sound + custom `notification.mp3` (Messenger-like ding) play হবে service worker থেকে।

**Existing flow**: Telegram + browser alert + in-app bell সব আগের মতো কাজ করবে — শুধু এই push টা যোগ হবে extra layer হিসেবে।

## Files to add/edit

- New: `public/manifest.json` (update), `public/sw.js`, `public/notification.mp3`
- New: `supabase/functions/send-push/index.ts`
- New migration: `push_subscriptions` table + trigger update
- Edit: `src/main.tsx` (SW register), `src/pages/admin/Notifications.tsx` (push UI)
- Add secrets: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`

Approve করলে শুরু করি?
