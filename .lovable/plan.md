## সমস্যা

Home page এ category strip (🌸 আইকনসহ horizontal row) এর class `sticky top-[6.4rem] z-30` — কিন্তু header এর actual height এই value এর সাথে match করছে না। ফলে scroll করলে strip stick হলেও header এর পিছনে hide হয়ে যাচ্ছে, যেন freeze কাজ করছে না।

Header stack (StoreLayout.tsx):
- AnnouncementBar (~28px)
- Main header h-14 (56px)
- Search bar (~36px)
- **মোট ≈ 120px**, কিন্তু sticky offset = 102px (6.4rem)

এছাড়া `z-30` < header এর `z-50`, তাই overlap হলে strip ঢেকে যাবে।

## Fix

`src/pages/store/Home.tsx` line 49:
- Sticky offset হেডারের নিচে fit করানো — একটা ref/measurement বা সরাসরি StoreLayout এর header কে একটা CSS variable (e.g. `--header-h`) expose করে strip এ `top: var(--header-h)` ব্যবহার করা।
- সবচেয়ে simple ও robust approach: StoreLayout এর sticky `<header>` এ একটা ResizeObserver দিয়ে height মাপা এবং `document.documentElement.style.setProperty('--header-h', ...)` সেট করা।
- Home এ category strip: `style={{ top: 'var(--header-h, 7.5rem)' }}` + `z-40` (header এর `z-50` এর নিচে but content এর উপর)।

এতে mobile/desktop, search bar এর height change হলেও সঠিকভাবে freeze থাকবে।

## পরিবর্তিত ফাইল
1. `src/components/store/StoreLayout.tsx` — header এ ref + ResizeObserver যোগ করে `--header-h` CSS variable set করা।
2. `src/pages/store/Home.tsx` — category strip এর hardcoded `top-[6.4rem]` সরিয়ে dynamic `var(--header-h)` ব্যবহার + z-index `z-40`।

কোনো design/business logic পরিবর্তন নেই — শুধু sticky behaviour ঠিক করা।