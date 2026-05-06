## Goal

Feni-এর বাইরে যেকোনো জেলায় Cash On Delivery (COD) সিলেক্ট করলে customer-কে আগে delivery charge advance pay করতে হবে (bKash/Nagad-এ), এবং transaction ID দিতে হবে। তবেই অর্ডার confirm হবে। Feni-র ভেতরে COD আগের মতোই — কোনো advance লাগবে না।

## Behavior Rules

1. **Feni + COD** → আগের মতোই, কোনো advance নেই।
2. **Outside Feni + COD** → নতুন rule:
   - Customer-কে delivery charge (e.g. ৳120) bKash/Nagad-এ পাঠাতে হবে (০১৭১৫৩০৭২৭১ — same numbers as bKash flow)।
   - Transaction ID input বাধ্যতামূলক।
   - বাকি product price delivery-তে cash দিবে।
3. **bKash / Bank (full payment)** → আগের মতোই, full amount + trxId।

## UI Changes — `src/pages/store/Checkout.tsx`

- নতুন derived flag: `needsAdvanceForCOD = paymentMethod === 'cod' && district && !isFeni`
- `needsTrxId` update → `bkash || bank || needsAdvanceForCOD`
- COD সিলেক্ট থাকলে এবং outside Feni হলে, payment section-এ একটা নতুন info block দেখাবে:
  - "আপনার জেলা Feni-এর বাইরে। অর্ডার confirm করতে delivery charge ৳{deliveryCharge} bKash/Nagad-এ advance পাঠান।"
  - bKash + Nagad number (copy button সহ — bkash flow থেকে reuse)
  - Transaction ID input (required)
  - একটা note: "বাকি ৳{total - discounts} delivery-র সময় cash দিবেন।"
- Review screen-এ "Advance Paid: ৳{deliveryCharge} (TrxID: xxx)" এবং "Cash on Delivery: ৳{remaining}" আলাদা দেখাবে।
- Validation (`handleContinueToReview`): COD + outside Feni হলে trxId required।

## Backend / Data

- নতুন column বা migration লাগবে না — existing fields যথেষ্ট:
  - `payment_method = 'cod'` থাকবে।
  - `payment_status` → outside Feni COD-এর জন্য `'partial'` set করব (advance paid for delivery)। Feni COD আগের মতোই `'pending'`।
  - TrxID আপাতত order note হিসাবে save হয় না — `delivery_address`-এ append করা হবে কিনা, না কি একটা নতুন optional field রাখব সেটা decide করতে হবে। **Recommendation:** edge function payload-এ `advanceTrxId` পাঠাব, এবং `place-order`-এ যদি COD + outside Feni হয় তাহলে order note হিসাবে `customer_email`-এর পাশে একটা স্পষ্ট জায়গায় না রেখে বরং একটা ছোট migration দিয়ে `advance_trx_id text` column add করব orders table-এ। (cleaner, admin Orders page-এ দেখানো যাবে)

## Edge Function — `supabase/functions/place-order/index.ts`

- Payload থেকে `advanceTrxId` accept করব।
- যদি `paymentMethod === 'cod'` এবং `deliveryDistrict !== 'Feni'` → `advanceTrxId` required (না থাকলে 400 error)। `payment_status = 'partial'` set করব।
- Insert payload-এ `advance_trx_id` column save।

## Admin Orders Page

- Orders list/detail-এ যেখানে payment info দেখানো হয়, COD outside Feni হলে "Advance ৳{deliveryCharge} paid (TrxID: xxx) — Cash ৳{remaining} on delivery" দেখাবে।

## Migration

```sql
ALTER TABLE public.orders
  ADD COLUMN advance_trx_id text;
```

## Files to Modify

- `src/pages/store/Checkout.tsx` — UI + validation
- `supabase/functions/place-order/index.ts` — server-side enforcement + save trxId
- `src/pages/admin/Orders.tsx` — display advance info (read-only)
- New migration for `advance_trx_id` column

## Out of Scope

- Real-time payment verification (manual trxId verification by admin, same as current bKash/bank flow).
- Refund flow if customer cancels after advance paid (admin manual)।
