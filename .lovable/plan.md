## Goals

Fix five customer-facing issues based on user feedback.

### 1. Product detail image — show full image, no crop

**File:** `src/pages/store/ProductDetail.tsx` (`ProductImageGallery`)

- Change main image from `object-cover` to `object-contain` so the uploaded image is shown exactly as-is (no cropping).
- Keep the `aspect-square` container with a soft background (already `bg-secondary/30`) so portrait/landscape images sit centered with letterbox padding.
- Thumbnails can stay `object-cover` (they're tiny previews).

### 2. Product description — full text with "Read More" toggle

**File:** `src/pages/store/ProductDetail.tsx`

- Remove the `line-clamp-4` truncation on the description.
- Replace with a controlled "Read more / Read less" toggle:
  - If description is longer than ~180 chars (or >4 lines worth), show clamped text + a `Read more` button.
  - Clicking expands to full text with a `Read less` button.
- Render description with `whitespace-pre-wrap` so the seller's line breaks/formatting are preserved exactly as typed in the admin form (matches FB-import caption/description behavior).
- Add translation keys: `product.readMore` (Read more / আরো পড়ুন), `product.readLess` (Read less / কম দেখুন).

### 3. Admin shortcuts at top of `/account`

**File:** `src/pages/store/Account.tsx`

- When `user?.role === 'admin'` (or `cashier`), render two prominent buttons (Dashboard, POS) in the top profile card area, right under the name/email block — easily reachable.
- Use icons (`LayoutDashboard`, `ScanBarcode`) and primary styling.
- Remove the duplicate Dashboard/POS links from `StoreLayout.tsx` footer "Follow Us" block (they remain reachable via Account; keeps footer clean). If preferred we can keep footer too — leaning toward keeping just at top per user request "নীচে থেকে সরাই".

### 4. Description shown to customer = exactly what admin types

**Files:** `src/pages/store/ProductDetail.tsx` (already covered in #2 via `whitespace-pre-wrap`), and verify Admin form (`src/pages/admin/Products.tsx`) saves the raw textarea string without trimming/normalization. No data change required — only the display side needs `whitespace-pre-wrap`.

### 5. Full language coverage + "YOUR SAVINGS" constant

**Files:** `src/data/language.tsx`, `src/pages/store/Account.tsx`, `src/pages/store/ProductDetail.tsx`

Add translation keys (bn + en):
- `product.savings` → both languages output literal: `YOUR SAVINGS` (always English label per user instruction). Used in ProductDetail savings line: `YOUR SAVINGS ৳{n}`.
- `account.myPoints` → আমার পয়েন্ট / My Points
- `account.totalEarned` → মোট অর্জিত / Total Earned
- `account.totalRedeemed` → মোট রিডিম / Total Redeemed
- `account.pointsRule` → "প্রতি ১০০ টাকায় ১ পয়েন্ট। ২০০ পয়েন্ট হলে রিডিম করতে পারবেন। ১ পয়েন্ট = ১ টাকা।" / "1 point per ৳100 spent. Redeem after 200 points. 1 point = ৳1."
- `account.recentTx` → সাম্প্রতিক লেনদেন / Recent Transactions

Replace the hardcoded Bengali strings in `Account.tsx` (lines 47, 52–53, 56, 59) with `t(...)` calls. Same for the savings line in `ProductDetail.tsx` (line 180) — always render `YOUR SAVINGS` regardless of language.

Also audit `ProductDetail.tsx` lines 156–157 ("মাত্র Xটি বাকি" / "Only X left") — already conditional on `lang`, fine.

## Out of scope

- No DB changes.
- No changes to admin product form data flow (it already saves raw description).

## Technical summary

- ProductDetail: `object-cover` → `object-contain` on main image; description gets expand/collapse state (`useState<boolean>`) + `whitespace-pre-wrap`.
- Account: conditional admin shortcut row; switch hardcoded bn strings to translation keys.
- language.tsx: add ~6 new keys.
- StoreLayout footer: remove the admin Dashboard/POS block (lines 282–287).
