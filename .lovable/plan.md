

## পরিকল্পনা: App হিসেবে চালানোর জন্য সব ঠিক করা

### সমস্যাগুলো যেগুলো এখন আছে:
1. **Data হারিয়ে যায়** — পেজ refresh করলে সব products, orders, users, cart সব মুছে যায়
2. **Login মনে রাখে না** — refresh করলে logout হয়ে যায়
3. **bKash/Nagad নম্বর placeholder** — "01XXXXXXXXX" দেখাচ্ছে, আসল নম্বর নেই
4. **POS Invoice-এ ফোন নম্বর placeholder** — "01XXXXXXXXX" আছে

---

### Step 1: Data Persistence — LocalStorage দিয়ে সব ডাটা সেভ রাখা

Zustand-এর `persist` middleware ব্যবহার করে সব store localStorage-এ সেভ হবে। Refresh করলেও ডাটা থাকবে।

**ফাইল: `src/data/store.ts`**
- `zustand/middleware` থেকে `persist` import
- `create(persist(...))` দিয়ে wrap করবো
- Products, orders, cart, categories, banners, wishlist, reviews — সব persist হবে

**ফাইল: `src/data/auth.ts`**
- Auth state ও persist করবো — login করলে refresh দিলেও logged in থাকবে

**ফাইল: `src/data/userRegistry.ts`**
- User registry ও persist করবো — signup করা users হারাবে না

### Step 2: bKash/Nagad আসল নম্বর বসানো

**ফাইল: `src/pages/store/Checkout.tsx`**
- সব `01XXXXXXXXX` → `01715307271` করবো (bKash ও Nagad দুইটাতেই)

**ফাইল: `src/components/pos/POSInvoice.tsx`**
- `📞 01XXXXXXXXX` → `📞 01715307271`

### Step 3: Checkout-এ phone placeholder ঠিক করা

**ফাইল: `src/pages/store/Checkout.tsx`**
- Phone input placeholder `01XXXXXXXXX` → `01XXXXXXXXX` রাখলেও হবে, এটা user-এর জন্য

---

### Technical Details

- **persist middleware**: `zustand/middleware` থেকে আসবে, কোনো নতুন package লাগবে না
- **Storage key**: প্রতিটা store-এর আলাদা key থাকবে (`pink-city-store`, `pink-city-auth`, `pink-city-users`)
- **৩টি data file** + **২টি template file** edit হবে, মোট ৫টি ফাইল

