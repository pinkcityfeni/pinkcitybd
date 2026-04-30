
# Daraz-স্টাইল ডিসকাউন্ট সিস্টেম

প্রোডাক্টের আসল সেলিং দাম একই রেখে একটা "MRP / আগের দাম" (compare_at_price) সেট করার সুবিধা যোগ করব। তখন স্টোরে দেখাবে:

```
৳৫০০  ̶৳̶৭̶০̶০̶   [-29%]
```

কাটা দাগের দামটা শুধু দেখানোর জন্য — চেকআউট, কার্ট, POS সব হিসাব হবে আসল `price` দিয়েই (কোনো হিসাব বদলাবে না)।

---

## কী কী হবে

### ১. ডাটাবেইজ
`products` টেবিলে নতুন একটা কলাম যোগ:
- `compare_at_price` (numeric, default 0) — এটাই কাটা দামে দেখাবে।

`0` হলে কোনো ডিসকাউন্ট ব্যাজ দেখাবে না (একদম স্বাভাবিক প্রোডাক্টের মতো)।

### ২. অ্যাডমিন → Products পেজ
"Add / Edit Product" ফর্মে নতুন একটা ফিল্ড:
- **পুরাতন দাম / MRP (ঐচ্ছিক)** — Selling Price এর পাশে।
- হেল্প টেক্সট: *"এটা সেলিং দামের চেয়ে বেশি দিলে কাস্টমার কাটা দাগ ও ডিসকাউন্ট % দেখবে। খালি/0 রাখলে কিছু দেখাবে না।"*
- ভ্যালিডেশন: যদি দেওয়া হয় তাহলে সেলিং দামের চেয়ে বেশি হতে হবে, না হলে এরর।

### ৩. স্টোরফ্রন্টে ডিসপ্লে
সব জায়গায় একই প্যাটার্ন — যেখানে যেখানে দাম দেখায়:
- `Home.tsx` (trending/featured cards)
- `Shop.tsx`, `Category.tsx` (প্রোডাক্ট লিস্ট)
- `ProductDetail.tsx` (প্রোডাক্ট পেজ)
- `Cart.tsx`, `Wishlist.tsx`

ডিসপ্লে রুল:
- compare_at_price > price হলে:
  - বড় করে: **৳{price}** (primary color)
  - পাশে ছোট করে কাটা দাগ: ~~৳{compare_at_price}~~ (muted)
  - একটা ছোট ব্যাজ: **−{%}** (rose/red color, rounded-full)
- নাহলে: শুধু ৳{price}

প্রোডাক্ট কার্ডের কোণায় একটা সুন্দর "SALE" ব্যাজ ও দেখাবে যেগুলোতে ডিসকাউন্ট আছে।

### ৪. POS
POSSales-এ প্রোডাক্ট কার্ডে শুধু রেফারেন্সের জন্য ছোট করে কাটা দাম দেখাবে (ক্যাশিয়ার বুঝবে কোনটা সেলে আছে), কিন্তু চার্জ হবে আসল `price` দিয়েই।

---

## টেকনিক্যাল ডিটেইল

**Migration:**
```sql
ALTER TABLE public.products
  ADD COLUMN compare_at_price numeric NOT NULL DEFAULT 0;
```

**Type updates:**
- `Product` ইন্টারফেসে `compareAtPrice: number` যোগ।
- `useSupabaseData.ts`-এর product mapper-এ snake_case ↔ camelCase কনভার্ট।

**Reusable component:** `src/components/store/PriceTag.tsx` — সব জায়গায় কনসিস্টেন্ট ডিসপ্লের জন্য একটা ছোট কম্পোনেন্ট। Props: `price`, `compareAt`, `size` ('sm'|'md'|'lg')। `%` হিসাব: `Math.round((compareAt - price) / compareAt * 100)`।

**হিসাবের কোনো জায়গায় হাত দেওয়া হবে না** — cart total, checkout, points earned, POS subtotal সব আগের মতোই `price` দিয়েই চলবে। compare_at_price নিছক ডিসপ্লে।

---

কোনো অংশে পরিবর্তন চাইলে বলুন, না হলে Approve করলে শুরু করব।
