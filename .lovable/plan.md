## সমস্যাটা আসলে কী

আমি check করলাম — `pinkcity.com.bd` domain technically **ঠিকই কাজ করছে**:
- DNS resolve হচ্ছে (185.158.133.1)
- HTTPS load হচ্ছে (HTTP 200, SSL active)
- Browser এ direct URL দিলে site আসবে

তাহলে Google এ আসছে না কেন? দুটো কারণ:

### 1. Google indexing এখনো হয়নি
নতুন domain Google index করতে কয়েক দিন – কয়েক সপ্তাহ লাগে। এই সময়ে Google search এ "pinkcity.com.bd" লিখলে আসবে না।

### 2. সব SEO tag পুরনো `lovable.app` URL এ point করছে
আপনার site এ এখনো canonical, sitemap, structured data — সবগুলোতে `pinkcitybd.lovable.app` দেওয়া। Google তাই আসল domain হিসেবে lovable.app কেই ধরছে, `pinkcity.com.bd` কে duplicate ভাবছে।

```text
index.html  → canonical = pinkcitybd.lovable.app  ❌
sitemap.xml → all URLs  = pinkcitybd.lovable.app  ❌
JSON-LD     → url       = pinkcitybd.lovable.app  ❌
OG image    = lovable.app domain                  ❌
```

## যা যা ঠিক করব

### Step 1 — সব SEO reference পাল্টে `pinkcity.com.bd` করব
- `index.html`:
  - `<link rel="canonical">` → `https://pinkcity.com.bd/`
  - JSON-LD এর `url` → `https://pinkcity.com.bd`
  - OG `og:url` → `https://pinkcity.com.bd/`
- `public/sitemap.xml`: সব URL `pinkcity.com.bd` এ পাল্টাব এবং product/category পাতাগুলো যোগ করব
- `public/robots.txt`: sitemap URL update

### Step 2 — Google কে তাড়াতাড়ি জানানোর জন্য
এটা আমি code এ করতে পারব না, আপনাকে একবার করতে হবে (১০ মিনিটের কাজ):

1. **Google Search Console** এ যান → `pinkcity.com.bd` add করুন
2. Domain verify করুন (DNS TXT record দিয়ে — Lovable Domain settings থেকে DNS manage করা যায়)
3. Sitemap submit করুন: `https://pinkcity.com.bd/sitemap.xml`
4. URL Inspection tool এ home URL দিয়ে **"Request Indexing"** চাপুন

এই step ছাড়া Google নিজে থেকে index করতে সপ্তাহ লেগে যাবে।

### Step 3 — Verify
আমি code change করার পর check করব:
- canonical tag correct
- sitemap এ নতুন URL
- DNS/SSL আগে থেকেই ঠিক আছে, তাই কিছু করতে হবে না

## এখন আপনি কী করতে পারেন (test এর জন্য)

iPhone Safari/Chrome এ **address bar এ সরাসরি লিখুন**: `pinkcity.com.bd` — site আসার কথা। যদি না আসে, তাহলে DNS/network issue, সেটা আলাদা debug করব।

Google search এ আসতে index হওয়া লাগবে — সেটা আমার code fix + আপনার Search Console submit এর পর শুরু হবে।
