

## পরিকল্পনা: ৪র্থ Trust Badge যোগ করা

### পরিবর্তন: `src/components/store/StoreLayout.tsx`

1. **Grid কলাম আপডেট**: `grid-cols-2 md:grid-cols-3` → `grid-cols-2 md:grid-cols-4` করবো যাতে ৪টি badge সুন্দরভাবে বসে।

2. **৪র্থ badge যোগ**: `RefreshCw` (or `RotateCcw`) icon দিয়ে **"Easy Return"** / **"সহজ রিটার্ন"** badge যোগ করবো। এটা e-commerce সাইটে খুবই common trust signal।

   ```
   Fast Delivery | 100% Original | 24/7 Support | Easy Return
   ```

3. Import-এ `RotateCcw` icon যোগ করবো lucide-react থেকে।

### Technical Details
- Line 1: `RotateCcw` import যোগ
- Line 182: grid class update → `md:grid-cols-4`
- Line 209 এর পরে: নতুন trust-badge div যোগ

