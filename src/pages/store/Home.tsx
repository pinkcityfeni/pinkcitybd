import { Link } from 'react-router-dom';
import { useStore } from '@/data/store';
import { useLanguage } from '@/data/language';
import { ShoppingCart, ChevronRight, Heart, Sparkles, Star, ArrowRight } from 'lucide-react';
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
  const { t } = useLanguage();
  const activeBanners = useMemo(() => banners.filter(b => b.active), [banners]);
  const shuffled = useMemo(() => [...products].sort(() => Math.random() - 0.5), [products]);
  const trending = useMemo(() => [...products].sort((a, b) => a.stock - b.stock).slice(0, 4), [products]);

  return (
    <div className="animate-fade-in">
      {/* Hero Banner */}
      {activeBanners.length > 0 ? (
        <BannerSlider banners={activeBanners} />
      ) : (
        <section className="hero-gradient relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 h-20 w-20 rounded-full bg-primary/10 animate-float" />
            <div className="absolute bottom-8 right-16 h-14 w-14 rounded-full bg-accent/10 animate-float" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/3 h-8 w-8 rounded-full bg-primary/5 animate-sparkle" />
          </div>
          <div className="container mx-auto px-4 py-12 sm:py-16 text-center relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium mb-4">
              <Sparkles className="h-3 w-3" /> {t('home.newCollection')}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-3">
              <span className="text-gradient-pink">{t('home.heroTitle1')}</span> {t('home.heroTitle2')}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto mb-6">
              {t('home.heroDesc')}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button asChild size="lg" className="rounded-full px-6 pink-glow">
                <Link to="/shop">
                  {t('home.viewAll')} <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Category Bar */}
      <section className="bg-card border-b">
        <div className="px-3 py-3">
          <div className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            {categories.map(c => (
              <Link key={c.id} to={`/shop?category=${encodeURIComponent(c.name)}`} className="flex flex-col items-center gap-1.5 min-w-[60px] group">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:from-primary/20 group-hover:to-accent/20 group-hover:scale-110 transition-all duration-300 shadow-sm group-hover:shadow-md overflow-hidden">
                  {c.image ? <img src={c.image} alt={c.name} className="h-full w-full object-cover" /> : <span className="text-xl">{c.icon}</span>}
                </div>
                <span className="text-[9px] font-semibold text-muted-foreground group-hover:text-primary text-center leading-tight whitespace-nowrap transition-colors">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending / Hot Products */}
      {trending.length > 0 && (
        <section className="px-3 py-5">
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="flex items-center gap-1.5 bg-destructive/10 text-destructive px-2.5 py-1 rounded-full">
              <span className="text-xs animate-sparkle">🔥</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">{t('home.trending')}</span>
            </div>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {trending.map(p => {
              const cat = categories.find(c => c.name === p.category);
              const isWished = wishlist.includes(p.id);
              return (
                <div key={p.id} className="min-w-[200px] max-w-[200px] product-card relative group">
                  <div className="absolute top-2 right-2 z-10">
                    <button
                      onClick={() => toggleWishlist(p.id)}
                      className="h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                    >
                      <Heart className={`h-3.5 w-3.5 ${isWished ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
                    </button>
                  </div>
                  <Link to={`/product/${p.id}`}>
                    <div className="aspect-[4/5] bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center overflow-hidden">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      ) : (
                        <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{cat?.icon || '📦'}</span>
                      )}
                    </div>
                  </Link>
                  <div className="p-2.5">
                    <Link to={`/product/${p.id}`}>
                      <h3 className="text-xs font-medium line-clamp-1 group-hover:text-primary transition-colors">{p.name}</h3>
                    </Link>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="font-display font-bold text-sm text-primary">৳{p.price.toFixed(0)}</span>
                      <Button
                        size="sm"
                        className="h-7 rounded-full text-[10px] px-3 pink-glow"
                        onClick={() => { addToCart(p); toast.success(t('home.added', { name: p.name })); }}
                        disabled={p.stock === 0}
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" /> {t('home.addBtn')}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* All Products */}
      <section className="px-2.5 py-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg font-bold">{t('home.forYou')}</h2>
          </div>
          <Link to="/shop" className="text-[11px] text-primary font-semibold flex items-center gap-0.5 hover:gap-1.5 transition-all">
            {t('home.viewAll')} <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
          {shuffled.map(p => {
            const cat = categories.find(c => c.name === p.category);
            const isWished = wishlist.includes(p.id);
            return (
              <div key={p.id} className="group product-card relative">
                <div className="absolute top-2 right-2 z-10">
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="h-7 w-7 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                  >
                    <Heart className={`h-3 w-3 ${isWished ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
                  </button>
                </div>
                <Link to={`/product/${p.id}`}>
                  <div className="aspect-square bg-gradient-to-br from-muted/20 to-muted/5 flex items-center justify-center relative overflow-hidden">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{cat?.icon || '📦'}</span>
                    )}
                    {p.stock < 5 && p.stock > 0 && (
                      <span className="absolute bottom-1.5 left-1.5 text-[8px] bg-destructive/90 text-destructive-foreground px-2 py-0.5 rounded-full font-bold backdrop-blur-sm">{t('home.onlyLeft', { n: p.stock })}</span>
                    )}
                    {p.stock === 0 && (
                      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="text-[10px] font-semibold text-muted-foreground bg-card/80 px-3 py-1 rounded-full">{t('home.outOfStock')}</span>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-2.5">
                  <Link to={`/product/${p.id}`}>
                    <h3 className="text-[11px] font-medium line-clamp-2 leading-snug group-hover:text-primary transition-colors">{p.name}</h3>
                  </Link>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className="h-2.5 w-2.5 fill-warning text-warning" />
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="font-display font-bold text-sm text-primary">৳{p.price.toFixed(0)}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 rounded-full hover:bg-primary/10 hover:text-primary"
                      onClick={() => { addToCart(p); toast.success(t('home.added', { name: p.name })); }}
                      disabled={p.stock === 0}
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="px-3 py-4">
        <div className="rounded-2xl overflow-hidden relative bg-gradient-to-r from-primary via-primary/90 to-accent p-6 sm:p-8 text-center pink-glow">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10 animate-float" />
            <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/5 animate-float" style={{ animationDelay: '3s' }} />
          </div>
          <div className="relative z-10">
            <span className="text-primary-foreground/80 text-xs font-medium uppercase tracking-wider">{t('home.specialOffer')}</span>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-primary-foreground mt-2 mb-1">{t('home.promoTitle')}</h3>
            <p className="text-primary-foreground/70 text-xs mb-4">{t('home.promoDesc')}</p>
            <Button asChild variant="secondary" className="rounded-full px-6">
              <Link to="/shop">{t('home.shopNow')} <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

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
      if (!pauseRef.current) {
        setCurrent(i => (i + 1) % banners.length);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    return () => { if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current); };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      const nextIdx = diff > 0
        ? (current + 1) % banners.length
        : (current - 1 + banners.length) % banners.length;
      goTo(nextIdx);
    }
  };

  const banner = banners[current];

  return (
    <section
      className="relative w-full overflow-hidden group"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative aspect-[2/1] sm:aspect-[3/1] w-full cursor-pointer" onClick={() => banners.length > 1 && goTo((current + 1) % banners.length)}>
        {banner.image ? (
          <img src={banner.image} alt={banner.title} className="w-full h-full object-cover transition-opacity duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary via-primary/85 to-accent flex items-center justify-center px-8">
            <h2 className="text-primary-foreground text-xl sm:text-3xl font-display font-bold text-center leading-snug drop-shadow-md">{banner.title}</h2>
          </div>
        )}
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {banners.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-white shadow-md' : 'w-2 bg-white/50'}`} />
          ))}
        </div>
      )}
    </section>
  );
}
