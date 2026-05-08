# আপনার কোডবেস audit — কী কী আছে আর কী ই আর কাজে আসছে না

আমি পুরো project স্ক্যান করে দেখলাম। নিচে দুইটা list:

---

## A) Code এ আছে কিন্তু আর কাজে আসছে না (remove করা যায়)

1. **`src/data/userRegistry.ts`** — কোথাও import হচ্ছে না। সম্পূর্ণ unused dead file।
2. **POS Barcode page** (`src/pages/pos/POSBarcode.tsx` + `/pos/barcode` route + POSLayout এর nav item)
   - Barcode scanner এখন আর কোনো actual flow এ ব্যবহার হচ্ছে না — শুধু একটা standalone page। চাইলে রাখতে পারেন, না চাইলে remove।
3. **Facebook Import** (`src/pages/admin/FacebookImport.tsx` + `/admin/fb-import` route + AdminLayout nav item)
   - এখনো admin sidebar এ আছে। আপনি use করছেন কিনা confirm করলে remove করব।
4. **পুরোনো notification কোড** এর কোন leftover আর নেই (আগের loop এ পরিষ্কার করা হয়েছে — verified)।
5. **Push subscription related migration / table** — DB তে `push_subscriptions` table drop হয়ে গেছে, কোডেও কিছু নেই — clean ✅।

---

## B) আরও যা যা change/improve করা যেতে পারে

### Performance / UX
1. **Bundle slim করা** — `src/components/ui/` তে ৪৯টা shadcn component আছে; অনেকগুলো সম্ভবত ব্যবহার হচ্ছে না। Audit করে unused গুলো delete করতে পারি (build size কমবে)।
2. **Image optimization** — `pink-city-text.jpg`, `logo.jpg` ইত্যাদি jpg/png; WebP এ convert করলে load fast হবে।
3. **Lazy loading routes** — Admin/POS pages এখন eagerly import হচ্ছে। `React.lazy()` দিয়ে split করলে customer-side initial load অনেক fast হবে।
4. **React Query stale time** — `new QueryClient()` default config এ; products/categories এর জন্য `staleTime` দিলে repeat fetch কমবে।

### Feature gaps / polish
5. **SEO** — Home/Shop/Category/Product pages এ `<title>`, meta description, JSON-LD product schema নেই। Google ranking এ help করবে।
6. **PWA / "Add to Home Screen"** — manifest + service worker দিলে mobile এ app-like install হবে।
7. **Order tracking page** — customer তার order এর status দেখতে পারে এমন কিছু আছে কিনা check করিনি; না থাকলে add করা যায়।
8. **Wishlist sync** — এখন local state তে নাকি DB তে save হচ্ছে check করে দরকার হলে DB-backed করা।
9. **Product reviews moderation flow** — admin reviews page আছে, কিন্তু customer-facing UI তে rating display কেমন আছে verify করা।
10. **Stock low alert** — Telegram notification এ "low stock" trigger যোগ করা।
11. **Customer points / loyalty** — DB তে `customer_points` + `point_transactions` table আছে আর hooks ও আছে, কিন্তু UI তে কতটুকু expose করা আছে দেখে polish করা যায়।

### Security / housekeeping
12. **Security scan run** — RLS policy review একটা scan চালিয়ে নিশ্চিত করা।
13. **Console errors / network errors** clean করা।

---

## পরবর্তী step

আপনি বলুন কোনগুলো করব — আমি একটা একটা করে handle করব। সবচেয়ে recommend করব:

- **প্রথমে A সেকশনের 1-3** (dead code remove) — safe + instant cleanup
- **তারপর B-1, B-3** (bundle slim + lazy routes) — site fast হবে
- **এরপর B-5** (SEO) — Google search এ আসার জন্য

কোনগুলোতে যাব?
