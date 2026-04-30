# Multi-Brand System (Personal / Pastel / Dorea)

আপনার shop এ এখন থেকে ৩টা brand থাকবে — **Personal** (আপনার নিজের), **Pastel**, **Dorea**। Customer storefront এ কোনো brand label দেখাবে না (একসাথে সব product আগের মতই দেখাবে), কিন্তু **admin/POS এ সব আলাদা করে track হবে** — category, stock, buying price, profit সব brand-wise।

## Database Changes

**1. New `brands` table**
```text
brands
├── id (uuid)
├── name (text) — 'Personal', 'Pastel', 'Dorea'
├── slug (text, unique)
├── color (text) — UI badge color
└── created_at
```
Default ৩টা brand seed হবে। Personal কে default ধরা হবে।

**2. `products` table এ `brand_id` column add**
- Nullable শুরুতে, existing সব product 'Personal' এ assign হবে, তারপর NOT NULL।

**3. `categories` table এ `brand_id` column add**
- প্রতিটা brand এর নিজস্ব category list থাকবে।
- Existing categories Personal এ যাবে।
- Pastel আর Dorea এর জন্য admin আলাদা category create করবে।

**4. RLS** — সব table এ admin/cashier manage, public read (categories/brands)।

## Admin UI Changes

**Brand Management (নতুন page `/admin/brands`)**
- Brand list, add/edit/delete (Personal delete করা যাবে না)
- Sidebar এ নতুন menu item

**Products page (`src/pages/admin/Products.tsx`)**
- Top এ **Brand filter tabs**: All / Personal / Pastel / Dorea
- Product form এ **Brand selector** (required)
- Category dropdown brand অনুযায়ী filter হবে — Pastel select করলে শুধু Pastel এর category দেখাবে
- Product card এ ছোট brand badge

**Categories page (`src/pages/admin/Categories.tsx`)**
- Top এ Brand tabs — প্রতি brand এর category আলাদা দেখাবে
- নতুন category create করার সময় brand select করতে হবে

**Inventory page (`src/pages/admin/Inventory.tsx`)**
- Brand filter add — brand-wise stock value দেখাবে

**Dashboard (`src/pages/admin/Dashboard.tsx`)**  নতুন section:
```text
┌─ Brand Performance ────────────────────────┐
│  Personal    Pastel      Dorea             │
│  Revenue:    Revenue:    Revenue:          │
│  Profit:     Profit:     Profit:           │
│  Stock val:  Stock val:  Stock val:        │
│  Orders:     Orders:     Orders:           │
└────────────────────────────────────────────┘
```
+ Brand-wise sales bar chart (last 30 days)।

**Sales page (`src/pages/admin/Sales.tsx`)** — Brand filter dropdown add।

## POS Changes
- POS Sales page এ product grid এ brand filter tabs
- Barcode scan এ brand auto-detect
- Receipt এ brand info (optional)

## Storefront — কোনো change নাই
Customer যেমন দেখছিল তেমনই দেখবে। সব product একসাথে, কোনো brand label না।

## Profit Calculation
প্রতি order এর items এর `brand_id` থেকে aggregate:
- Brand revenue = sum(item.price × qty) for brand's items
- Brand profit = sum((price − buying_price) × qty)
- Returns deduct হবে

## Files to Create/Edit

**Migration:** new `brands` table + `brand_id` columns + seed Personal/Pastel/Dorea + assign existing data to Personal

**New files:**
- `src/pages/admin/Brands.tsx`
- `src/components/admin/BrandFilter.tsx`
- `src/components/admin/BrandBadge.tsx`
- `src/hooks/useBrands.ts` (or extend `useSupabaseData.ts`)

**Edit:**
- `src/pages/admin/Products.tsx` — brand filter + form selector
- `src/pages/admin/Categories.tsx` — brand tabs
- `src/pages/admin/Inventory.tsx` — brand filter
- `src/pages/admin/Dashboard.tsx` — Brand Performance section + chart
- `src/pages/admin/Sales.tsx` — brand filter
- `src/pages/pos/POSSales.tsx` — brand filter tabs
- `src/components/admin/AdminLayout.tsx` — sidebar এ "Brands" menu
- `src/App.tsx` — route add
- `src/data/store.ts` + `src/hooks/useSupabaseData.ts` — Brand type, queries, mutations
- `src/data/language.tsx` — translation keys

## Implementation Order
1. Migration (brands table + brand_id + seed + assign existing → Personal)
2. Brand types, hooks, queries
3. Admin Brands page + sidebar
4. Products page brand integration
5. Categories page brand integration
6. Inventory + Sales brand filter
7. Dashboard Brand Performance section
8. POS brand filter

Approve করলে implementation শুরু করব।
