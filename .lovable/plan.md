

## সমস্যা

Line 18-এ `useMemo` দিয়ে products shuffle করা হয়েছে `[products]` dependency দিয়ে। যেহেতু Zustand store-এর `products` reference একই থাকে, shuffle শুধু একবারই হয় — refresh বা page revisit-এ নতুন করে হয় না।

## সমাধান

`useMemo` এর বদলে `useState` + `useEffect` ব্যবহার করবো যাতে প্রতিবার component mount হলে (page visit/refresh) নতুন করে shuffle হয়।

### পরিবর্তন: `src/pages/store/Home.tsx`

**আগে (line 18):**
```ts
const shuffled = useMemo(() => [...products].sort(() => Math.random() - 0.5), [products]);
```

**পরে:**
```ts
const [shuffled, setShuffled] = useState<typeof products>([]);
useEffect(() => {
  setShuffled([...products].sort(() => Math.random() - 0.5));
}, [products]);
```

এতে প্রতিবার Home page-এ ঢুকলে বা refresh দিলে products নতুনভাবে সাজানো হবে।

