
User wants a bulk import table view in the FB Import page where they can paste multiple FB posts at once, preview them in a table, select which ones to import, and bulk-create products.

**Design approach:**

Add a new "Bulk Import" tab on the existing `/admin/fb-import` page (keep the single-import flow as well). The bulk view needs:

1. **Paste area** — one big textarea where user pastes multiple posts separated by a delimiter (`---` on its own line, simple & natural)
2. **Image URLs** — since FB images aren't in the text, allow per-row image URL paste OR a smart format where users paste `IMG: https://...` lines inside each post block
3. **Parsed preview table** — auto-parses on paste with columns: Select (checkbox), Image preview, Name (editable), Price (editable), Stock (editable), Category (dropdown), Action (remove row)
4. **Bulk actions toolbar** — "Select All", "Apply category to selected", set default stock, then "Import N selected" button
5. **Per-row inline edit** — name/price/stock editable directly in table cells; category dropdown per row
6. **Image handling** — re-upload to our `images` bucket (reuse existing `persistFbImages` logic) during import to avoid FB URL expiry
7. **Progress feedback** — during bulk import show "Importing 3/10..." with toast updates; failed rows stay in table marked red so user can retry

## Plan

### Paste format (shown in a small help box)
```
Product Name 1
Description line
Price: 500
IMG: https://...image1.jpg
IMG: https://...image2.jpg
---
Product Name 2
...
```

### Files to change
1. **`src/pages/admin/FacebookImport.tsx`** — wrap existing single-import in a `<Tabs>` component; add new "Bulk Import" tab with:
   - Bulk paste textarea + parse button
   - Editable preview table (using existing `Table` component from `src/components/ui/table.tsx`)
   - Bulk toolbar (select all, default category, default stock, import button)
   - Reuse existing `persistFbImages` and `useAddProduct` mutation
   - Sequential import loop with progress toast and per-row status (`pending` / `importing` / `success` / `failed`)

### Parser logic
- Split pasted text by `\n---\n` → array of post blocks
- For each block: first non-IMG line = name, lines starting with `IMG:` = images, price regex on rest, remainder = description
- Output array of draft rows that populate the table

### UX details
- Empty rows skipped silently
- Rows missing name OR price OR image are marked invalid (red border, can't be selected)
- Default category dropdown above the table applies to all selected rows
- After successful import, success rows auto-removed; failed rows stay with error tooltip

### Out of scope (mention briefly)
- No FB API/scraping — still purely paste-based
- No per-row subcategory in table (uses category default; can edit later in Products page)

## Files
- `src/pages/admin/FacebookImport.tsx` (refactor to tabs + add bulk view)

No new routes, no DB changes, no edge functions.
