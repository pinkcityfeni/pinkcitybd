import { Link } from 'react-router-dom';
import { useStore } from '@/data/store';
import { useLanguage } from '@/data/language';
import { ShoppingCart, ChevronRight, Heart, Star, ArrowRight, Truck, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

export default function Home() {
  const products = useStore(s => s.products);
  const categories = useStore(s => s.categories);
  const addToCart = useStore(s => s.addToCart);
  const banners = useStore(s => s.banners);
  const wishlist = useStore(s => s.wishlist);
  const toggleWishlist = useStore(s => s.toggleWishlist);
  const { t, lang } = useLanguage();
  const activeBanners = useMemo(() => banners.filter(b => b.active), [banners]);
  const [shuffled, setShuffled] = useState<typeof products>([]);
  useEffect(() => {
    setShuffled([...products].sort(() => Math.random() - 0.5));
  }, [products]);
  const trending = useMemo(() => [...products].sort((a, b) => a.stock - b.stock).slice(0, 6), [products]);
  const newArrivals = useMemo(() => [...products].slice(-8), [products]);

  return (
    <div className="animate-fade-in">
      {/* Hero Banner */}
      {activeBanners.length > 0 ? (
        <BannerSlider banners={activeBanners} />
      ) : (
        <section className="bg-gradient-to-br from-secondary via-background to-secondary/50">
          <div className="container mx-auto px-4 py-16 sm:py-20 text-center relative">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">{t('home.newCollection')}</p>
            <h1 className="font-display text-3xl sm:text-5xl font-bold leading-tight mb-4">
              {t('home.heroTitle1')} <span className="text-gradient-pink">{t('home.heroTitle2')}</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">{t('home.heroDesc')}</p>
            <Button asChild size="lg" className="rounded-lg px-8 h-12 text-sm font-semibold shadow-md">
              <Link to="/shop">{t('home.shopNow')} <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
          </div>
        </section>
      )}

      {/* Category Strip */}
      <section className="border-b bg-background">
        <div className="container mx-auto px-3 py-3">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-0.5">
            {categories.map(c => (
              <Link key={c.id} to={`/shop?category=${encodeURIComponent(c.name)}`} className="flex flex-col items-center gap-1 min-w-[52px] group">
                <div className="h-11 w-11 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-105 transition-all duration-300 overflow-hidden border">
                  {c.image ? <img src={c.image} alt={c.name} className="h-full w-full object-cover" /> : <span className="text-base">{c.icon}</span>}
                </div>
                <span className="text-[9px] font-medium text-muted-foreground group-hover:text-primary text-center leading-tight whitespace-nowrap transition-colors">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      {trending.length > 0 && (
        <section className="container mx-auto px-3 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="section-title flex items-center gap-2">🔥 {t('home.trending')}</h2>
              <p className="text-xs text-muted-foreground mt-1">{lang === 'bn' ? 'সবচেয়ে জনপ্রিয় পণ্য' : 'Most popular products'}</p>
            </div>
            <Link to="/shop" className="text-xs text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              {t('home.viewAll')} <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {trending.map(p => (
              <ProductCard key={p.id} product={p} categories={categories} wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} t={t} compact />
            ))}
          </div>
        </section>
      )}

      {/* Feature Banner */}
      <section className="bg-secondary/50 py-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center gap-2">
              <Truck className="h-6 w-6 text-primary" />
              <p className="text-[10px] sm:text-xs font-semibold">{lang === 'bn' ? 'দ্রুত ডেলিভারি' : 'Fast Delivery'}</p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <p className="text-[10px] sm:text-xs font-semibold">{lang === 'bn' ? '১০০% অরিজিনাল' : '100% Original'}</p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <span className="text-lg font-bold text-primary">৳</span>
              <p className="text-[10px] sm:text-xs font-semibold">{lang === 'bn' ? 'সেরা দাম' : 'Best Price'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* All Products */}
      <section className="container mx-auto px-3 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="section-title">{t('home.forYou')}</h2>
            <p className="text-xs text-muted-foreground mt-1">{lang === 'bn' ? 'আমাদের সেরা কালেকশন' : 'Our best collection'}</p>
          </div>
          <Link to="/shop" className="text-xs text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            {t('home.viewAll')} <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {shuffled.map(p => (
            <ProductCard key={p.id} product={p} categories={categories} wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} t={t} />
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="container mx-auto px-4 pb-8">
        <div className="rounded-xl overflow-hidden relative bg-primary p-8 sm:p-12 text-center">
          <div className="relative z-10">
            <p className="text-primary-foreground/70 text-[10px] font-semibold uppercase tracking-widest mb-2">{t('home.specialOffer')}</p>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-primary-foreground mb-2">{t('home.promoTitle')}</h3>
            <p className="text-primary-foreground/60 text-xs mb-6">{t('home.promoDesc')}</p>
            <Button asChild variant="secondary" className="rounded-lg px-8 h-10 text-sm font-semibold">
              <Link to="/shop">{t('home.shopNow')} <ArrowRight className="h-3.5 w-3.5 ml-2" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Product Card Component ─── */
function ProductCard({ product: p, categories, wishlist, toggleWishlist, addToCart, t, compact }: any) {
  const cat = categories.find((c: any) => c.name === p.category);
  const isWished = wishlist.includes(p.id);
  const getProductRating = useStore(s => s.getProductRating);
  const rating = getProductRating(p.id);

  return (
    <div className="group product-card relative rounded-lg overflow-hidden border bg-background">
      {/* Wishlist */}
      <button
        onClick={() => toggleWishlist(p.id)}
        className="absolute top-1 right-1 z-10 h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
      >
        <Heart className={`h-3 w-3 ${isWished ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
      </button>

      {/* Stock badge */}
      {p.stock < 5 && p.stock > 0 && (
        <span className="absolute top-1 left-1 z-10 text-[7px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded font-semibold">
          {t('shop.lowStock')}
        </span>
      )}

      <Link to={`/product/${p.id}`}>
        <div className="aspect-[4/5] bg-secondary/30 flex items-center justify-center overflow-hidden relative">
          {p.image ? (
            <img src={p.image} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          ) : (
            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{cat?.icon || '📦'}</span>
          )}
          {p.stock === 0 && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
              <span className="text-[10px] font-semibold text-muted-foreground bg-background/80 px-3 py-1 rounded">{t('home.outOfStock')}</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-1.5">
        <Link to={`/product/${p.id}`}>
          <h3 className="text-[10px] font-medium line-clamp-2 leading-tight group-hover:text-primary transition-colors">{p.name}</h3>
        </Link>

        {rating.count > 0 && (
          <div className="flex items-center gap-0.5 mt-0.5">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`h-2 w-2 ${s <= Math.round(rating.avg) ? 'fill-warning text-warning' : 'text-border'}`} />
              ))}
            </div>
            <span className="text-[8px] text-muted-foreground">({rating.count})</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-1">
          <span className="font-bold text-xs text-primary" style={{ fontFamily: 'DM Sans, sans-serif' }}>৳{p.price.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Banner Slider ─── */
function BannerSlider({ banners }: { banners: import('@/data/store').Banner[] }) {
  const [current, setCurrent] = useState(0);
  const pauseRef = useRef(false);
  const touchStartX = useRef(0);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
    pauseRef.current = true;
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => { pauseRef.current = false; }, 3000);
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      if (!pauseRef.current) setCurrent(i => (i + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  useEffect(() => () => { if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current); }, []);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? (current + 1) % banners.length : (current - 1 + banners.length) % banners.length);
  };

  const banner = banners[current];

  return (
    <section className="relative w-full overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <Link to={banner.link || '/shop'} className="relative block w-full cursor-pointer aspect-[21/9]">
        {banner.image ? (
          <>
            <img src={banner.image} alt={banner.title} className="w-full h-full object-cover transition-opacity duration-500" />
            {banner.title && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <h2 className="text-white text-sm sm:text-2xl font-display font-bold drop-shadow-lg leading-snug">{banner.title}</h2>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary to-accent flex items-center justify-center px-8">
            <h2 className="text-primary-foreground text-lg sm:text-3xl font-display font-bold text-center leading-snug drop-shadow-md">{banner.title}</h2>
          </div>
        )}
      </Link>
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {banners.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`} />
          ))}
        </div>
      )}
    </section>
  );
}
