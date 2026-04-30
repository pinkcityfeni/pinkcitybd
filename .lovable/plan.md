# Reward Point System Plan

**নিয়ম:**
- প্রতি ১০০ টাকা খরচে ১ পয়েন্ট জমা হবে
- ১ পয়েন্ট = ১ টাকা (redeem করার সময়)
- ২০০ পয়েন্ট হলে redeem করা যাবে (minimum threshold)
- Online: শুধু logged-in customer পয়েন্ট পাবে
- POS: customer-এর phone number দিলে পয়েন্ট তার account-এ যাবে (phone দিয়ে customer খুঁজে বের করা হবে)

---

## 1. Database Changes (migration)

**নতুন table — `customer_points`:**
```
- id (uuid)
- user_id (uuid, nullable) — logged-in customer হলে
- phone (text) — primary lookup key (POS-এ phone দিয়ে customer match হবে)
- name (text)
- points (int, default 0) — current balance
- total_earned (int, default 0) — lifetime earned
- total_redeemed (int, default 0)
- created_at, updated_at
- UNIQUE on phone
```

**নতুন table — `point_transactions`** (history/audit):
```
- id, customer_id (FK customer_points), order_id, type ('earn'|'redeem'),
  points (int), created_at
```

**`orders` table-এ ৩টি নতুন column:**
- `customer_phone_normalized` (text) — phone-based lookup
- `points_earned` (int, default 0)
- `points_redeemed` (int, default 0)

**RLS:**
- `customer_points`: Admin/cashier ALL; user নিজের row দেখতে পারবে (user_id match)
- `point_transactions`: Admin/cashier ALL; user নিজেরটা SELECT

---

## 2. Backend — `place-order` edge function update

Order place করার সময়:

**Earning logic:**
- Online order: `userId` থাকলে ওই user-এর `customer_points` row find/create (phone দিয়ে), points যোগ
- POS order: `customer_phone` দিলে phone দিয়ে row find/create, points যোগ
- Earned points = `Math.floor(total / 100)` (delivery charge বাদে product subtotal-এর উপর)
- `total_earned`, `points` update + `point_transactions` insert
- `orders.points_earned` save

**Redeem logic:**
- Frontend থেকে `redeemPoints` (int) আসবে
- Validate: customer-এর `points >= redeemPoints` এবং `points >= 200` (minimum)
- Order total থেকে redeemPoints টাকা বাদ যাবে (discount-এর মতো)
- Customer-এর points minus, `total_redeemed` plus, transaction log

---

## 3. Frontend Changes

### A. Online Checkout (`src/pages/store/Checkout.tsx`)
- Logged-in হলে customer-এর current points show করা (Lovable Cloud থেকে fetch)
- যদি points >= 200 → "Redeem Points" section: কতগুলো পয়েন্ট ব্যবহার করতে চায় slider/input
- Order summary-তে redeem amount দেখানো
- Order success page-এ "আপনি X পয়েন্ট অর্জন করেছেন" message

### B. POS Sales (`src/pages/pos/POSSales.tsx`)
- Cart panel-এ নতুন **Customer section**:
  - Phone input + "Find" button
  - Phone match হলে customer-এর name + current points দেখাবে (অটো)
  - Match না হলে "New customer" — name input (optional, পরে save হবে)
- Points >= 200 হলে "Redeem" toggle + amount input
- Sale complete হলে invoice-এ "Earned: X points, New balance: Y" দেখাবে

### C. Account page (`src/pages/store/Account.tsx`)
- নতুন "My Points" card: current balance, lifetime earned, recent transactions

### D. Admin — নতুন page `src/pages/admin/Customers.tsx`
- `customer_points` table list (search by phone/name)
- Manual point adjust (admin override)
- AdminLayout nav-এ "Customers" link যোগ

---

## 4. Settings (admin configurable later)
আপাতত hard-coded:
- `EARN_RATE = 100` (১০০ টাকা = ১ পয়েন্ট)
- `MIN_REDEEM = 200`
- `POINT_VALUE = 1` (১ পয়েন্ট = ১ টাকা)

পরে চাইলে `app_settings` table-এ rule গুলো রাখা যাবে।

---

## Files to Touch
- `supabase/migrations/...` (new tables + orders columns + RLS)
- `supabase/functions/place-order/index.ts` (earn + redeem logic)
- `src/hooks/useSupabaseData.ts` (useCustomerPoints, useFindCustomerByPhone hooks)
- `src/pages/store/Checkout.tsx` (redeem UI + earning preview)
- `src/pages/pos/POSSales.tsx` (customer phone + redeem UI)
- `src/pages/store/Account.tsx` (points card)
- `src/pages/admin/Customers.tsx` (new — list + adjust)
- `src/components/admin/AdminLayout.tsx` (nav link)
- `src/App.tsx` (route)
- `src/data/language.tsx` (translations)

Approve করলে সবগুলো একসাথে implement করব।
