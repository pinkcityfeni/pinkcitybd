import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Lang = 'bn' | 'en';

// ─── Translation dictionary ───
const translations = {
  // Navigation & Layout
  'nav.home': { bn: 'হোম', en: 'Home' },
  'nav.shop': { bn: 'শপ', en: 'Shop' },
  'nav.category': { bn: 'ক্যাটাগরি', en: 'Categories' },
  'nav.cart': { bn: 'কার্ট', en: 'Cart' },
  'nav.account': { bn: 'অ্যাকাউন্ট', en: 'Account' },
  'nav.search': { bn: 'পণ্য খুঁজুন...', en: 'Search products...' },
  'nav.signIn': { bn: 'সাইন ইন', en: 'Sign In' },

  // Home
  'home.forYou': { bn: 'আপনার জন্য', en: 'For You' },
  'home.viewAll': { bn: 'সব দেখুন', en: 'View All' },
  'home.onlyLeft': { bn: 'মাত্র {n}টি বাকি', en: 'Only {n} left' },
  'home.outOfStock': { bn: 'স্টক শেষ', en: 'Out of Stock' },
  'home.added': { bn: 'যোগ হয়েছে: {name}', en: 'Added: {name}' },

  // Shop
  'shop.title': { bn: 'সকল পণ্য', en: 'All Products' },
  'shop.found': { bn: '{n}টি পণ্য পাওয়া গেছে', en: '{n} products found' },
  'shop.all': { bn: 'সব', en: 'All' },
  'shop.noProducts': { bn: 'কোনো পণ্য পাওয়া যায়নি', en: 'No products found' },
  'shop.changeFilter': { bn: 'ফিল্টার পরিবর্তন করুন', en: 'Change your filters' },
  'shop.lowStock': { bn: 'কম স্টক', en: 'Low stock' },

  // Cart
  'cart.title': { bn: 'কার্ট', en: 'Cart' },
  'cart.items': { bn: '{n}টি পণ্য', en: '{n} items' },
  'cart.empty': { bn: 'কার্ট খালি', en: 'Cart is empty' },
  'cart.emptyDesc': { bn: 'সুন্দর পণ্য যোগ করুন', en: 'Add some beautiful products' },
  'cart.startShopping': { bn: 'শপিং শুরু করুন', en: 'Start Shopping' },
  'cart.each': { bn: '৳{price} প্রতিটি', en: '৳{price} each' },
  'cart.remaining': { bn: '{n}টি বাকি', en: '{n} remaining' },
  'cart.maxStock': { bn: 'সর্বোচ্চ স্টক', en: 'Max stock reached' },
  'cart.orderSummary': { bn: 'অর্ডার সারসংক্ষেপ', en: 'Order Summary' },
  'cart.subtotal': { bn: 'সাবটোটাল', en: 'Subtotal' },
  'cart.deliveryCharge': { bn: 'ডেলিভারি চার্জ', en: 'Delivery Charge' },
  'cart.seeAtCheckout': { bn: 'চেকআউটে দেখুন', en: 'See at checkout' },
  'cart.points': { bn: 'পয়েন্ট', en: 'Points' },
  'cart.checkout': { bn: 'চেকআউট', en: 'Checkout' },
  'cart.continueShopping': { bn: 'শপিং চালিয়ে যান', en: 'Continue Shopping' },

  // Product Detail
  'product.notFound': { bn: 'পণ্য পাওয়া যায়নি', en: 'Product not found' },
  'product.backToShop': { bn: 'শপে ফিরুন', en: 'Back to Shop' },
  'product.reviews': { bn: '{n}টি রিভিউ', en: '{n} reviews' },
  'product.inStock': { bn: '{n}টি স্টকে আছে', en: '{n} in stock' },
  'product.earnPoints': { bn: '{n} পয়েন্ট পাবেন', en: 'Earn {n} points' },
  'product.addToCart': { bn: 'কার্টে যোগ করুন', en: 'Add to Cart' },
  'product.buyNow': { bn: 'এখনই কিনুন', en: 'Buy Now' },
  'product.barcode': { bn: 'বারকোড', en: 'Barcode' },
  'product.reviewRating': { bn: 'রিভিউ ও রেটিং', en: 'Reviews & Ratings' },
  'product.writeReview': { bn: 'আপনার রিভিউ দিন', en: 'Write a Review' },
  'product.yourName': { bn: 'আপনার নাম', en: 'Your name' },
  'product.yourReview': { bn: 'আপনার মতামত লিখুন...', en: 'Write your review...' },
  'product.submit': { bn: 'জমা দিন', en: 'Submit' },
  'product.noReviews': { bn: 'এখনো কোনো রিভিউ নেই', en: 'No reviews yet' },
  'product.youMayLike': { bn: 'আপনার পছন্দ হতে পারে', en: 'You May Also Like' },
  'product.stockLimitError': { bn: 'মাত্র {n}টি স্টকে আছে', en: 'Only {n} in stock' },
  'product.addedToCart': { bn: '{qty}× {name} কার্টে যোগ হয়েছে', en: '{qty}× {name} added to cart' },
  'product.reviewSubmitted': { bn: 'রিভিউ সংযুক্ত হয়েছে!', en: 'Review submitted!' },
  'product.enterName': { bn: 'আপনার নাম দিন', en: 'Please enter your name' },
  'product.enterReview': { bn: 'রিভিউ লিখুন', en: 'Please write a review' },

  // Checkout
  'checkout.title': { bn: 'চেকআউট', en: 'Checkout' },
  'checkout.backToCart': { bn: 'কার্টে ফিরুন', en: 'Back to Cart' },
  'checkout.guestOrder': { bn: 'গেস্ট হিসেবে অর্ডার করছেন', en: 'Ordering as Guest' },
  'checkout.guestDesc': { bn: 'লগইন ছাড়াই অর্ডার করতে পারবেন', en: 'You can order without logging in' },
  'checkout.loginPrompt': { bn: 'লগইন করুন — পয়েন্ট ও ট্র্যাকিং সুবিধা পান', en: 'Login — Get points & order tracking' },
  'checkout.loggedInAs': { bn: '{name} হিসেবে লগইন আছেন', en: 'Logged in as {name}' },
  'checkout.earnPointsDesc': { bn: 'এই অর্ডার থেকে পয়েন্ট পাবেন', en: 'You\'ll earn points from this order' },
  'checkout.contact': { bn: 'যোগাযোগ', en: 'Contact' },
  'checkout.name': { bn: 'নাম', en: 'Name' },
  'checkout.fullName': { bn: 'আপনার পূর্ণ নাম', en: 'Your full name' },
  'checkout.email': { bn: 'ইমেইল', en: 'Email' },
  'checkout.deliveryInfo': { bn: 'ডেলিভারি তথ্য', en: 'Delivery Details' },
  'checkout.phone': { bn: 'ফোন নম্বর', en: 'Phone Number' },
  'checkout.address': { bn: 'ডেলিভারি ঠিকানা', en: 'Delivery Address' },
  'checkout.addressPlaceholder': { bn: 'পূর্ণ ঠিকানা লিখুন - এলাকা, শহর...', en: 'Full address - area, city...' },
  'checkout.deliveryZone': { bn: 'ডেলিভারি এলাকা', en: 'Delivery Zone' },
  'checkout.feni': { bn: 'ফেনী', en: 'Feni' },
  'checkout.outsideFeni': { bn: 'ফেনীর বাইরে', en: 'Outside Feni' },
  'checkout.paymentMethod': { bn: 'পেমেন্ট মেথড', en: 'Payment Method' },
  'checkout.continueToReview': { bn: 'রিভিউ করুন', en: 'Review Order' },
  'checkout.orderReview': { bn: 'অর্ডার রিভিউ', en: 'Order Review' },
  'checkout.goBack': { bn: 'পিছনে যান', en: 'Go Back' },
  'checkout.products': { bn: 'পণ্য', en: 'Products' },
  'checkout.delivery': { bn: 'ডেলিভারি', en: 'Delivery' },
  'checkout.total': { bn: 'মোট', en: 'Total' },
  'checkout.confirmOrder': { bn: 'অর্ডার কনফার্ম করুন', en: 'Confirm Order' },
  'checkout.orderConfirmed': { bn: 'অর্ডার কনফার্ম!', en: 'Order Confirmed!' },
  'checkout.orderSuccess': { bn: 'আপনার অর্ডার সফলভাবে প্লেস হয়েছে', en: 'Your order has been placed successfully' },
  'checkout.moreShopping': { bn: 'আরো শপিং করুন', en: 'Continue Shopping' },
  'checkout.myOrders': { bn: 'আমার অর্ডার দেখুন', en: 'View My Orders' },
  'checkout.payment': { bn: 'পেমেন্ট', en: 'Payment' },
  'checkout.enterPhone': { bn: 'ফোন নম্বর দিন', en: 'Please enter phone number' },
  'checkout.enterAddress': { bn: 'ডেলিভারি ঠিকানা দিন', en: 'Please enter delivery address' },
  'checkout.enterTrxId': { bn: 'Transaction ID দিন', en: 'Please enter Transaction ID' },
  'checkout.enterCardNumber': { bn: 'সম্পূর্ণ কার্ড নম্বর দিন', en: 'Enter complete card number' },
  'checkout.enterExpiry': { bn: 'কার্ডের মেয়াদ দিন (MM/YY)', en: 'Enter card expiry (MM/YY)' },
  'checkout.enterCvv': { bn: 'CVV দিন', en: 'Enter CVV' },
  'checkout.enterCardName': { bn: 'কার্ডধারীর নাম দিন', en: 'Enter cardholder name' },
  'checkout.orderPlaced': { bn: 'অর্ডার সফলভাবে প্লেস হয়েছে!', en: 'Order placed successfully!' },
  'checkout.copied': { bn: 'কপি হয়েছে!', en: 'Copied!' },

  // Account
  'account.title': { bn: 'আমার অ্যাকাউন্ট', en: 'My Account' },
  'account.rewardPoints': { bn: 'রিওয়ার্ড পয়েন্ট', en: 'Reward Points' },
  'account.orders': { bn: 'অর্ডার', en: 'Orders' },
  'account.logout': { bn: 'লগআউট', en: 'Logout' },
  'account.wishlist': { bn: 'উইশলিস্ট', en: 'Wishlist' },
  'account.recentOrders': { bn: 'সাম্প্রতিক অর্ডার', en: 'Recent Orders' },
  'account.noOrders': { bn: 'এখনো কোনো অর্ডার নেই', en: 'No orders yet' },
  'account.orderCancelled': { bn: 'অর্ডার বাতিল হয়েছে', en: 'Order has been cancelled' },
  'account.orderReceived': { bn: 'অর্ডার রিসিভ', en: 'Order Received' },
  'account.processing': { bn: 'প্রসেসিং', en: 'Processing' },
  'account.delivered': { bn: 'ডেলিভারি সম্পন্ন', en: 'Delivered' },

  // Auth
  'auth.welcomeBack': { bn: 'স্বাগতম', en: 'Welcome back' },
  'auth.signInDesc': { bn: 'আপনার অ্যাকাউন্টে সাইন ইন করুন', en: 'Sign in to your account' },
  'auth.emailLabel': { bn: 'ইমেইল', en: 'Email' },
  'auth.passwordLabel': { bn: 'পাসওয়ার্ড', en: 'Password' },
  'auth.signInBtn': { bn: 'সাইন ইন', en: 'Sign In' },
  'auth.noAccount': { bn: 'অ্যাকাউন্ট নেই?', en: "Don't have an account?" },
  'auth.signUp': { bn: 'সাইন আপ', en: 'Sign up' },
  'auth.createAccount': { bn: 'অ্যাকাউন্ট তৈরি করুন', en: 'Create an account' },
  'auth.earnRewards': { bn: 'আজ থেকে রিওয়ার্ড পয়েন্ট পান', en: 'Start earning reward points today' },
  'auth.joinDesc': { bn: 'এক্সক্লুসিভ অফার ও অর্ডার ট্র্যাক করুন', en: 'Join for exclusive offers & track orders' },
  'auth.fullName': { bn: 'পূর্ণ নাম', en: 'Full Name' },
  'auth.createBtn': { bn: 'অ্যাকাউন্ট তৈরি করুন', en: 'Create Account' },
  'auth.haveAccount': { bn: 'অ্যাকাউন্ট আছে?', en: 'Already have an account?' },
  'auth.signIn': { bn: 'সাইন ইন', en: 'Sign in' },
  'auth.invalidCreds': { bn: 'ভুল ইমেইল বা পাসওয়ার্ড', en: 'Invalid email or password' },
  'auth.passwordShort': { bn: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে', en: 'Password must be at least 6 characters' },
  'auth.accountCreated': { bn: 'অ্যাকাউন্ট তৈরি হয়েছে! 🎉', en: 'Account created! Welcome! 🎉' },
  'auth.demoAccounts': { bn: 'ডেমো অ্যাকাউন্ট', en: 'Demo Accounts' },

  // Category
  'category.title': { bn: 'সকল ক্যাটাগরি', en: 'All Categories' },
  'category.products': { bn: '{n} পণ্য', en: '{n} products' },
  'category.noSub': { bn: 'কোনো সাবক্যাটাগরি নেই', en: 'No subcategories' },
  'category.noCat': { bn: 'কোনো ক্যাটাগরি নেই', en: 'No categories yet' },

  // Footer
  'footer.tagline': { bn: 'আপনার সৌন্দর্য পণ্যের ঠিকানা।', en: 'Your destination for beauty products.' },
  'footer.shop': { bn: 'শপ', en: 'Shop' },
  'footer.allProducts': { bn: 'সকল পণ্য', en: 'All Products' },
  'footer.categories': { bn: 'ক্যাটাগরি', en: 'Categories' },
  'footer.accountSection': { bn: 'অ্যাকাউন্ট', en: 'Account' },
  'footer.login': { bn: 'লগইন', en: 'Login' },
  'footer.newAccount': { bn: 'নতুন অ্যাকাউন্ট', en: 'New Account' },
  'footer.admin': { bn: 'অ্যাডমিন', en: 'Admin' },
  'footer.dashboard': { bn: 'ড্যাশবোর্ড', en: 'Dashboard' },

  // General
  'general.all': { bn: 'সব', en: 'All' },
} as const;

export type TranslationKey = keyof typeof translations;

// ─── Context ───
interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem('app-lang');
    return (saved === 'en' || saved === 'bn') ? saved : 'bn';
  });

  const handleSetLang = useCallback((newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem('app-lang', newLang);
  }, []);

  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>): string => {
    const entry = translations[key];
    if (!entry) return key;
    let text: string = entry[lang] || entry.bn;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
