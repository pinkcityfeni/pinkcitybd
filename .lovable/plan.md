# POS Return Management System

POS-এ একটা পূর্ণাঙ্গ Return / Refund management system যোগ করব, যেখানে cashier বা admin কোনো পুরোনো POS sale খুঁজে নির্দিষ্ট item return করতে পারবে, stock auto-restore হবে, points adjust হবে, এবং সব return একটা history page-এ দেখা যাবে।

## What you'll get

1. **Sales History page-এ "Return" button** — প্রতিটা POS order-এর পাশে নতুন Return button।
2. **Return Dialog** — order-এর item list দেখাবে, প্রতিটার পাশে quantity selector (max = sold qty − already returned)। Reason field (optional)। Refund method (Cash / bKash / Nagad / Bank)।
3. **Auto stock restore** — যত qty return হবে, ঠিক তত product stock-এ যোগ হবে।
4. **Points adjustment** — যদি ওই order-এ points earn হয়ে থাকে, return-এর প্রোপোরশনাল অংশ customer-এর balance থেকে কেটে নেবে (point_transactions-এ `adjust` entry সহ)।
5. **Order status update** — সব item return হলে status = `cancelled`, partial হলে `returned` (নতুন status) এবং Sales History-তে badge দেখাবে।
6. **Returns History page** — `/pos/returns` route, কে কখন কোন order থেকে কী return করেছে তার log।
7. **Receipt** — return slip print করার অপশন (POSInvoice-এর মতো ছোট thermal-style)।
8. **Permission** — admin + cashier উভয়েই use করতে পারবে (existing POS access)।

## Technical Plan

### Database (new migration)

New table `pos_returns`:
```
id uuid pk
order_id uuid not null
items jsonb not null        -- [{ product_id, name, quantity, price }]
total_refund numeric not null
refund_method text          -- cash/bkash/nagad/bank
reason text
points_reverted int default 0
processed_by uuid            -- auth.uid() of cashier/admin
created_at timestamptz default now()
```
RLS: admin + cashier ALL; users SELECT own (via order user_id).

Add column to `orders`:
- `returned_items jsonb default '[]'` — quick lookup of how many of each product already returned (so we can cap further returns).
- Allow `status` value `'returned'` (already text, so no enum change).

### Backend logic — Edge function `process-return`

Why edge function: stock decrement + points reversal + return insert must be atomic with service role. Validates JWT, checks role (admin/cashier), then:
1. Loads order, validates qty ≤ sold − already returned per item.
2. Inserts row in `pos_returns`.
3. Updates `orders.returned_items` and `status` (`returned` or `cancelled`).
4. For each item: `UPDATE products SET stock = stock + qty`.
5. If order had `points_earned`, computes proportional revert = `round(points_earned * refundTotal / orderTotal)` and:
   - `UPDATE customer_points SET points = points - revert, total_earned = total_earned - revert`
   - inserts `point_transactions` (type='adjust', negative).

### Frontend

- **`src/pages/pos/POSReturns.tsx`** — new page listing all returns with filters (date, order id).
- **`src/components/pos/ReturnDialog.tsx`** — modal opened from Sales History; per-item qty input, refund total auto-calculated, method dropdown, reason textarea, Confirm button calling edge function.
- **`src/pages/pos/POSSalesHistory.tsx`** — add "Return" button per row; show status badge variant for `returned`.
- **`src/components/pos/POSLayout.tsx`** — add nav link "Returns" → `/pos/returns`.
- **`src/App.tsx`** — register `/pos/returns` route.
- **`src/hooks/useSupabaseData.ts`** — add `useReturns()` hook.
- **`src/data/store.ts`** — add `Return` type, allow `status: 'returned'` on Order.
- **`src/data/language.tsx`** — add bn/en strings: Return, Refund, Reason, Quantity, Returned items, ইত্যাদি।

### UX flow

```
Sales History → Click order row → "Return" button
   ↓
Return Dialog opens (items with qty steppers, refund method, reason)
   ↓
Confirm → edge function → success toast → optional print slip
   ↓
Order shows "Returned" badge; Returns page logs entry
```

### Edge cases handled

- Cannot return more than originally sold minus already-returned.
- Cannot return from an already fully-cancelled order.
- If customer has fewer points now than the revert amount, points cap at 0 (no negative).
- Online orders (`type='online'`) excluded from POS return (admin orders page can get a similar feature later if needed).

Approve করলে আমি migration + edge function + UI সব implement করে দেব।
