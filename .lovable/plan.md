## Goal

Three related admin/POS improvements:

1. **Duplicate barcode warning** when adding/editing a product with an existing barcode.
2. **Barcode scanner** inside the Product add/edit dialog — scan a code and auto-fill the barcode field (and if the barcode already exists, show the duplicate warning).
3. **Delete confirmation dialogs** before any destructive action across admin pages — replace `window.confirm` and bare `mutate` calls with a consistent `AlertDialog`.

---

## 1. Duplicate barcode warning (`src/pages/admin/Products.tsx`)

Extend the existing duplicate-name flow:

- Add new state `duplicateBarcode: Product | null`.
- In `handleSave`, after the name check, if `form.barcode` is non-empty:
  - Find `dup = products.find(p => p.barcode.trim() === form.barcode.trim() && p.id !== editProduct?.id)`.
  - If found → `setDuplicateBarcode(dup)` and stop. Otherwise continue to `performSave`.
- Add a second `AlertDialog` (similar style) titled "⚠️ একই Barcode-এর প্রোডাক্ট আছে" showing the existing product's name, brand, category, stock, price.
  - Cancel → close dialog, keep edit form open so user can fix the barcode.
  - "হ্যাঁ, save করুন" → call `performSave()` (allow override).
- Edits: when editing the same product, do not warn against itself (handled by `p.id !== editProduct?.id`).

## 2. Barcode scanner inside product form

Add a "📷 Scan" button next to the Barcode input in the product dialog.

- Use the browser camera via `BarcodeDetector` API when available; fall back to manual input message if not supported.
- Implementation:
  - New small component `src/components/admin/BarcodeScannerDialog.tsx`:
    - Opens a dialog with a `<video>` element using `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })`.
    - Loop with `BarcodeDetector` (formats: `ean_13`, `ean_8`, `code_128`, `upc_a`, `qr_code`) reading frames every ~300ms.
    - On detection → call `onDetected(code)`, stop tracks, close dialog.
    - Show "Browser এ Barcode scanner support নেই" message if `'BarcodeDetector' in window` is false.
    - Close button stops camera tracks.
- In `Products.tsx`:
  - Add scan button (Camera icon) inside the barcode field group.
  - On detected code → set `form.barcode`, then immediately check for duplicates among existing products and toast a warning ("এই barcode আগে থেকেই আছে: <name>") if found, but still fill the field so user can decide.

## 3. Delete confirmation everywhere

Replace ad-hoc deletes with shadcn `AlertDialog`. Pages to update:

| File | Current | After |
|---|---|---|
| `src/pages/admin/Products.tsx` (mobile + desktop trash buttons) | direct `deleteProductMut.mutate(p.id)` | open `deleteId` AlertDialog |
| `src/pages/admin/Brands.tsx` | direct `deleteBrandMut.mutate` | AlertDialog |
| `src/pages/admin/Categories.tsx` | direct `deleteCategoryMut.mutate` | AlertDialog |
| `src/pages/admin/Banners.tsx` | direct `deleteBannerMut.mutate` | AlertDialog |
| `src/pages/admin/Vouchers.tsx` | `window.confirm` | AlertDialog |
| `src/pages/admin/Reviews.tsx` | `window.confirm` | AlertDialog |

Pattern (already used in `Orders.tsx` / `Users.tsx`):

```text
const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);

<button onClick={() => setDeleteTarget(item)}>...</button>

<AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
  <AlertDialogContent>
    Title: "<Type> ডিলিট করবেন?"
    Desc: shows the item name + warning that it cannot be undone.
    Cancel | Delete (destructive) → run mutation, toast, clear target.
  </AlertDialogContent>
</AlertDialog>
```

All copy in Bengali to match project tone (e.g. "এটি ডিলিট করবেন? এই কাজ আর ফেরানো যাবে না।").

---

## Files changed

- `src/pages/admin/Products.tsx` — duplicate-barcode dialog, scan button, delete confirm dialog (replaces both inline trash handlers).
- `src/components/admin/BarcodeScannerDialog.tsx` — new camera-based scanner dialog.
- `src/pages/admin/Brands.tsx` — delete confirm dialog.
- `src/pages/admin/Categories.tsx` — delete confirm dialog.
- `src/pages/admin/Banners.tsx` — delete confirm dialog.
- `src/pages/admin/Vouchers.tsx` — replace `confirm()` with AlertDialog.
- `src/pages/admin/Reviews.tsx` — replace `confirm()` with AlertDialog.

No DB / edge function changes needed.
