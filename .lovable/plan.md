## অবস্থা

আগের ফিক্সেই এই কাজটা মূলত হয়ে গেছে:
- `<header>` (logo + nav + search bar) already `sticky top-0 z-50` — scroll এ উপরে থাকবে।
- Category strip এখন `sticky top: var(--header-h)` + `z-40` — header এর actual height মেপে ঠিক নিচে freeze হবে।

শুধু announcement bar (উপরের সরু rose-pink ribbon) sticky না, scroll এ উপরে চলে যায়। User-এর choice অনুযায়ী এটাই কাঙ্ক্ষিত (logo+search+category freeze, announcement freeze না)।

## যাচাই
- Preview reload করে home page scroll করলে দেখতে হবে: announcement উপরে চলে যাচ্ছে, কিন্তু logo + search bar + 🌸 category row screen এর top এ stuck আছে।

যদি এখনো scroll এ search/category উপরে চলে যায়, তাহলে নতুন issue — তখন আরো debug করতে হবে (parent overflow, transform context, ইত্যাদি)।

## অতিরিক্ত পরিবর্তন প্রয়োজন?
আপাতত **নতুন কোনো code change লাগছে না** — আগের patch ই এই behaviour deliver করছে। User কে preview refresh করে check করতে বলব। সমস্যা থাকলে next iteration এ ancestor overflow/transform investigate করব।