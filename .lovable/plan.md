
# Voucher System Plan

আপনার Glamora shop-এ একটি complete voucher system যোগ করব — Admin voucher বানাবে, customer checkout বা POS-এ code apply করে fixed taka discount পাবে।

## Features

- **Admin → Vouchers page**: voucher create/edit/delete, list, status toggle
- **Discount type**: Fixed amount (টাকা) — admin যত টাকা set করবে তত কাটবে
- **Scope**: প্রতিটা voucher হবে **Product-specific** অথবা **Category-specific** (admin select করবে)
- **Expiry date**: admin start_at + expire_at set/edit করতে পারবে
- **Per-customer limit**: প্রতি customer (phone দিয়ে track) voucher-প্রতি কতবার use করতে পারবে — admin set করবে (default 1)
- **Min order amount** (optional): voucher apply হতে minimum cart total লাগবে
- **Active/Inactive toggle**: meyad এর ভেতরেও admin manually disable করতে পারবে
- **Online Checkout + POS দুই জায়গায়**: customer code type করবে → eligible items detect হবে → discount apply

## How customer uses it

1. Cart-এ product যোগ করে Checkout/POS-এ যাবে
2. "Voucher Code" input-এ code লিখে **Apply** চাপবে
3. System validate করবে: active? expired? scope match (cart-এ ওই product/category আছে?)? customer limit বাকি? min order ok?
4. Eligible হলে total থেকে fixed taka কাটবে এবং order place হলে usage record হবে
5. Invalid হলে clear error message দেখাবে

## Database changes (migration)

**Table: `vouchers`**
- `id`, `code` (unique, uppercase), `discount_amount` (numeric, fixed taka)
- `scope_type` ('product' | 'category'), `scope_product_id` (nullable), `scope_category` (nullable text)
- `start_at`, `expire_at` (timestamptz)
- `per_customer_limit` (int, default 1)
- `min_order_amount` (numeric, default 0)
- `active` (boolean, default true)
- `created_at`, `updated_at`

**Table: `voucher_redemptions`**
- `id`, `voucher_id` (fk), `order_id` (nullable for safety), `customer_phone_normalized`, `user_id` (nullable), `discount_applied`, `created_at`
- Used to enforce per-customer limit (count where voucher_id + phone match)

**RLS**:
- `vouchers`: public SELECT (so client can validate), admin ALL
- `voucher_redemptions`: admin/cashier ALL, users view own (by user_id)
- Validation triggers (not CHECK) for `expire_at > start_at`

## Frontend changes

**New: `src/pages/admin/Vouchers.tsx`** — list + create/edit dialog with fields:
- Code, Discount amount, Scope (product/category dropdown), Start date, Expire date, Per-customer limit, Min order, Active toggle

**New: `src/components/VoucherInput.tsx`** — reusable component (input + Apply button + applied state) used in both Checkout and POSSales

**Edit: `src/components/admin/AdminLayout.tsx`** — add "Vouchers" nav item with `Ticket` icon

**Edit: `src/App.tsx`** — register `/admin/vouchers` route

**Edit: `src/pages/store/Checkout.tsx`** — add VoucherInput above payment section, include `voucherDiscount` in grandTotal calc and pass voucher info to place-order

**Edit: `src/pages/pos/POSSales.tsx`** — add VoucherInput in totals area, same flow

**Edit: `src/hooks/useSupabaseData.ts`** — add `useVouchers`, `useCreateVoucher`, `useUpdateVoucher`, `useDeleteVoucher`, `useValidateVoucher` hooks

## Backend (edge function)

**New: `supabase/functions/validate-voucher/index.ts`**
- Input: `{ code, cartItems, customerPhone, userId }`
- Returns: `{ valid, discountAmount, voucherId, error? }`
- Checks: exists, active, within date range, scope match (cart contains eligible product/category), per-customer redemption count < limit, min order amount met

**Edit: `supabase/functions/place-order/index.ts`**
- Accept `voucherCode` in payload
- Re-validate voucher server-side (security — never trust client discount)
- Apply `voucherDiscount` to order total before delivery
- Insert row into `voucher_redemptions` after successful order
- Store `voucher_code` and `voucher_discount` columns on `orders` for record

**Edit: `orders` table** — add `voucher_code` (text), `voucher_discount` (numeric default 0) columns

## Validation logic order (server-side, place-order)

```text
1. Find voucher by code (active=true)
2. Check now() between start_at and expire_at
3. Check scope: cart MUST contain product (scope_type=product → scope_product_id) 
   OR cart MUST contain item with category=scope_category
4. Compute eligible subtotal; check min_order_amount
5. Count redemptions for (voucher_id, phone_normalized) → must be < per_customer_limit
6. discount = min(discount_amount, eligible_subtotal)  // never negative
7. Apply, insert redemption row
```

## Admin Vouchers page UI sketch

```text
+--------------------------------------------------------+
|  Vouchers                          [+ New Voucher]     |
+--------------------------------------------------------+
| Code     Discount  Scope         Expires    Used  Active|
| GLAM50   ৳50       Product:Ring  10 May     3/∞   [✓]  |
| LIPSTICK ৳100      Cat: Cosmetic 30 Jun     0     [✓]  |
+--------------------------------------------------------+
```

Dialog form: Code (auto-uppercase), Discount ৳, Scope radio (Product / Category) → dropdown, Start/Expire datepickers, Per-customer limit, Min order, Active switch.

## Out of scope (future)

- Percentage discounts
- Total usage cap (across all customers)
- Multi-product / multi-category scope per voucher
- Auto-apply best voucher

---

Approve করলে আমি migration চালিয়ে, edge function deploy করে, পুরো UI build করে দেব।
