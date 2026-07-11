# Secret Leak Audit — pinkcity.com.bd

আমি পুরো project scan করেছি (source, edge functions, `.env`, `index.html`, configs)। ফলাফল নিচে — **কোনো sensitive secret frontend এ leak হয়নি**, তাই কোনো code change লাগবে না। এই plan approve করলে আমি শুধু একটা `.env.example` file add করবো documentation-এর জন্য।

## 1. Findings — সব secret কোথায় পাওয়া গেছে

| # | Secret | Location | Type | Status |
|---|--------|----------|------|--------|
| 1 | `VITE_SUPABASE_PUBLISHABLE_KEY` (anon JWT) | `.env` line 2 | **Public** (anon key) | ✅ Safe — এটা browser এ ship করার জন্যই বানানো, RLS protect করে |
| 2 | `VITE_SUPABASE_URL` | `.env` line 3 | Public | ✅ Safe |
| 3 | `VITE_SUPABASE_PROJECT_ID` | `.env` line 1 | Public | ✅ Safe |
| 4 | `SUPABASE_SERVICE_ROLE_KEY` | `supabase/functions/*/index.ts` (6 files: place-order, validate-voucher, telegram-notify, delete-user, list-users, process-return) | **Secret** | ✅ Safe — শুধু `Deno.env.get()` দিয়ে read, hardcode নাই |
| 5 | `SUPABASE_ANON_KEY`, `SUPABASE_URL` | Edge functions | Server-side reads | ✅ Safe |
| 6 | `LOVABLE_API_KEY` | `telegram-notify/index.ts` | Secret | ✅ Safe — `Deno.env.get()` only |
| 7 | `TELEGRAM_API_KEY` | `telegram-notify/index.ts` | Secret (connector) | ✅ Safe — `Deno.env.get()` only |

Source (`src/`) tree তে কোনো hardcoded API key, token, password, database URL, SMTP cred, OAuth secret, Stripe key, বা OpenAI key নাই। Regex scan clean (`sk_live_`, `sk_test_`, `AIza…`, `ghp_…`, `xox[bp]-…`, `BEGIN PRIVATE KEY` — সব zero match)।

## 2. Frontend exposure check

- `import.meta.env.VITE_*` শুধু `SUPABASE_URL` আর `PUBLISHABLE_KEY` (anon) — দুটোই designed-public।
- Service role key কোনো `VITE_` prefix এ নাই → Vite bundle এ যাবে না।
- `index.html` তে কোনো inline secret নাই।

## 3. .gitignore অবস্থা

Current `.gitignore` এ `.env` **explicitly listed নাই** — শুধু `*.local` আছে। Lovable Cloud এ এটা তেমন risk না কারণ `.env` এ শুধু public anon key + URL, কিন্তু best practice হিসেবে `.env` add করা উচিত। (এটা optional — approve করলে করবো।)

## 4. Logs / error responses

Edge functions review করলাম — সব `catch` block generic message return করে (`"Request failed. Please try again."`), কোনো stack trace বা secret client কে পাঠানো হচ্ছে না। ✅

## 5. Previously committed secrets — rotation warning

Repo history আমি সরাসরি check করতে পারি না, তবে current tree তে কোনো real secret hardcoded নাই। **তবু নিরাপত্তার জন্য এই secrets গুলো rotate করার সুপারিশ করছি যদি কখনো chat/screenshot/repo তে expose হয়ে থাকে**:
- `SUPABASE_SERVICE_ROLE_KEY` — Cloud dashboard এ visible না, তাই সম্ভবত safe
- `TELEGRAM_API_KEY` (bot token) — যদি সন্দেহ থাকে, BotFather এ `/revoke` করে নতুন token নিয়ে reconnect
- `LOVABLE_API_KEY` — আমি rotate tool দিয়ে rotate করে দিতে পারি এক ক্লিকে

## 6. Planned changes (approve করলে)

1. **Create `.env.example`** — placeholder সহ documentation file (কোনো real value থাকবে না):
   ```
   VITE_SUPABASE_PROJECT_ID=your-project-id
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   ```
2. **Add `.env` to `.gitignore`** (best practice, though current .env has only public values).

কোনো source file বা edge function edit করবো না — সব secrets already properly configured।

## Final confirmation

✅ **কোনো sensitive secret frontend/browser bundle এ exposed নাই।**
✅ সব server-only secret (service role, Lovable key, Telegram) edge function এ `Deno.env.get()` দিয়ে access হচ্ছে।
✅ Production deploy safe — শুধু উপরের ২টা housekeeping change approve করলে করে দিবো।
