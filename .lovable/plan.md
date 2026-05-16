## সমস্যা কী?

Database-এ ৪টা product আছে, কিন্তু storefront-এ একটাও show হচ্ছে না।

আমি check করে দেখলাম — storefront `products_public` view থেকে product fetch করে। Network log-এ ওই request `200 OK` দিচ্ছে কিন্তু response `[]` (empty)।

### Root cause

আগের security fix-এ `products` table-এর `"Public can view products"` policy drop করা হয়েছিল (যাতে `buying_price` leak না হয়)। `products_public` view সেই table-এর উপর তৈরি, এবং সেটা `security_invoker = on` mode-এ আছে — মানে view query করলে caller-এর (anon user-এর) permission দিয়ে base table পড়ার চেষ্টা করে। Base table-এ anon-এর কোনো SELECT policy নেই, তাই view সবসময় empty return করছে।

পাশাপাশি view-এ `anon` / `authenticated` role-এর জন্য SELECT grant-ও missing।

## Fix plan

একটা নতুন migration দিয়ে:

1. `products_public` view-কে **`security_invoker = off`** (security definer mode) করা — যাতে view owner-এর permission দিয়ে base table পড়ে, RLS bypass করে। এটা safe কারণ view-এ `buying_price` already excluded।
2. View-এর উপর `GRANT SELECT ... TO anon, authenticated` reapply করা।
3. Verify: anon দিয়ে `select * from products_public` করলে ৪টা product আসছে কিনা।

### Technical detail

```sql
ALTER VIEW public.products_public SET (security_invoker = off);
GRANT SELECT ON public.products_public TO anon, authenticated;
```

Base `products` table-এর RLS policies অপরিবর্তিত থাকবে (admin/cashier only) — তাই `buying_price` এখনো customer-দের কাছে hidden।

Migration apply করার পর storefront refresh করলেই product দেখাবে।