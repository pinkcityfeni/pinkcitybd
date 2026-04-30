# Fix: "Function components cannot be given refs" warning

## Problem
Console এ warning আসছে:
- `BrandFilter` এবং `Inventory` function components এ ref forward হচ্ছে কিন্তু support নেই।
- UI break হচ্ছে না, কিন্তু dev console এ noise তৈরি করছে।

## Root cause
`src/components/admin/BrandFilter.tsx` plain function component হিসেবে export করা। কোনো parent (Radix Slot বা hot-reload tooling) এতে ref pass করছে।

## Fix
**File: `src/components/admin/BrandFilter.tsx`**
- Component কে `React.forwardRef<HTMLDivElement, BrandFilterProps>` দিয়ে wrap করব
- Forwarded ref টা root `<div>` এ attach করব
- `displayName = 'BrandFilter'` set করব

## Verification
- Inventory page এ গিয়ে console check করব — warning চলে যাবে
- Brand filter এর existing functionality (click → filter) intact থাকবে

## Out of scope
- বাকি কোনো feature change না
- অন্য কোনো component এ ref warning থাকলে সেটা পরে আলাদা করে দেখব
