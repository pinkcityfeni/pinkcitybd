# Duplicate Product Name Warning

প্রোডাক্ট add করার সময় same name এর প্রোডাক্ট থাকলে warning dialog দেখাবে।

## Change
**File:** `src/pages/admin/Products.tsx`

- `handleSave` এ new product add এর আগে check করব: `products.find(p => p.name.trim().toLowerCase() === form.name.trim().toLowerCase())`
- Duplicate পেলে AlertDialog open হবে existing product এর details সহ (Brand, Category, Stock, Price)
- User confirm দিলে save হবে, cancel দিলে edit dialog এ ফিরবে
- Edit mode এ check skip (same product update হচ্ছে)

## UI
AlertDialog message:
"⚠️ এই নামে একটি প্রোডাক্ট আগে থেকেই আছে — [Name] (Brand: X · Stock: Y · ৳Z)। আপনি কি তবুও নতুন প্রোডাক্ট হিসেবে add করতে চান?"

Buttons: "না, বাতিল করুন" / "হ্যাঁ, add করুন"