## Goal
Facebook Import-এ "Original/Compare-at Price" (discount) field যোগ করা — যাতে FB থেকে product import করার সময়ও discount price set করা যায়, ঠিক যেমন Manual Product add-এ আছে।

## Changes — `src/pages/admin/FacebookImport.tsx`

### 1. Single Import
- `EMPTY` object-এ `compareAtPrice: ''` add করব।
- Product Details section-এ Selling Price / Buying Price row-এর নিচে নতুন একটা field:
  - **Original Price (৳)** — `compareAtPrice` input (number, optional)
  - Helper text: "Discount দেখাতে selling price-এর চেয়ে বড় দিন"
- `handleImport()`-এ payload-এ `compareAtPrice: Number(form.compareAtPrice) || 0` যোগ করব।
- Auto-parse: pasted text-এ "৩০০ ৳ ~~৫০০~~" বা `was 500` জাতীয় pattern detect করার চেষ্টা — simple regex (`/(?:was|আগে|original)\s*[:\-]?\s*(\d{2,6})/i` এবং `/~~\s*(\d{2,6})\s*~~/`)। পেলে `compareAtPrice` auto-fill।

### 2. Bulk Import
- `DraftRow` interface-এ `compareAtPrice: string` field যোগ।
- `parseBulkText()`-এ একই regex দিয়ে original price detect → row-এ set।
- Table-এ একটা নতুন column **"Original ৳"** (Price column-এর পাশে), inline editable।
- "Apply to selected" toolbar-এ optional `defaultCompareAt` input + button (small)।
- `handleBulkImport()`-এর payload-এ `compareAtPrice: Number(row.compareAtPrice) || 0`।
- `validRows` check-এ change লাগবে না (optional field)।

### 3. UI Polish
- যদি `compareAtPrice > price` হয়, একটা ছোট badge ("X% off") দেখাবে preview-তে — user-কে confirm দিতে।
- যদি `compareAtPrice ≤ price` (and not 0), warning toast: "Original price selling price-এর চেয়ে বড় হতে হবে" — কিন্তু block করব না, just clear করে দেব 0।

## Out of scope
- DB schema changes — `products.compare_at_price` already exists।
- Manual Products page — already supports discount।

Approve করলে implement করে দেব।
