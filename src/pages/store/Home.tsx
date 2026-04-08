import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/data/store';
import { ShoppingCart, ChevronRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState, useEffect, useMemo, useCallback } from 'react';

export default function Home() {
  const { products, categories, addToCart, banners, wishlist, toggleWishlist } = useStore();
  const activeBanners = banners.filter(b => b.active);
  const shuffled = useMemo(() => [...products].sort(() => Math.random() - 0.5), [products]);

  return (
    <div className="animate-fade-in">
      {activeBanners.length > 0 && <BannerSlider banners={activeBanners} />}

      <section className="bg-card border-b">
        <div className="px-3 py-2.5">
          <div className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            {categories.map(c => (
              <Link key={c.id} to={`/shop?category=${encodeURIComponent(c.name)}`} className="flex flex-col items-center gap-1 min-w-[56px] group">
                <div className="h-11 w-11 rounded-full bg-primary/8 flex items-center justify-center group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-200 shadow-sm">
                  <span className="text-xl">{c.icon}</span>
                </div>
                <span className="text-[9px] font-medium text-muted-foreground group-hover:text-primary text-center leading-tight whitespace-nowrap">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-2.5 py-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="font-display text-lg font-bold">আপনার জন্য</h2>
          <Link to="/shop" className="text-[11px] text-primary font-semibold flex items-center gap-0.5">
            সব দেখুন <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {shuffled.map(p => {
            const cat = categories.find(c => c.name === p.category);
            const isWished = wishlist.includes(p.id);
            return (
              <div key={p.id} className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all duration-200">
                <Link to={`/product/${p.id}`}>
                  <div className="aspect-square bg-muted/20 flex items-center justify-center relative overflow-hidden">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{cat?.icon || '📦'}</span>
                    )}
                    {p.stock < 5 && p.stock > 0 && (
                      <span className="absolute bottom-1 left-1 text-[8px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full font-bold">মাত্র {p.stock}টি বাকি</span>
                    )}
                    {p.stock === 0 && (
                      <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                        <span className="text-[10px] font-semibold text-muted-foreground">স্টক শেষ</span>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-2">
                  <Link to={`/product/${p.id}`}>
                    <h3 className="text-[11px] font-medium line-clamp-2 leading-snug group-hover:text-primary transition-colors">{p.name}</h3>
                  </Link>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="font-display font-bold text-sm text-primary">৳{p.price.toFixed(0)}</span>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => toggleWishlist(p.id)}
                        className="h-7 w-7 p-0 rounded-full flex items-center justify-center hover:bg-primary/10 transition-colors"
                      >
                        <Heart className={`h-3.5 w-3.5 ${isWished ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
                      </button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 rounded-full hover:bg-primary/10 hover:text-primary"
                        onClick={() => { addToCart(p); toast.success(`যোগ হয়েছে: ${p.name}`); }}
                        disabled={p.stock === 0}
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function BannerSlider({ banners }: { banners: import('@/data/store').Banner[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const next = useCallback(() => setCurrent(i => (i + 1) % banners.length), [banners.length]);
  const prev = useCallback(() => setCurrent(i => (i - 1 + banners.length) % banners.length), [banners.length]);

  useEffect(() => {
    if (banners.length <= 1 || paused) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [banners.length, next, paused]);

  // Touch/swipe support
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setPaused(true);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
    setTimeout(() => setPaused(false), 3000);
  };

  const banner = banners[current];

  return (
    <section
      className="relative w-full overflow-hidden group"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Banner content — click left/right halves to navigate */}
      <div className="relative aspect-[2/1] sm:aspect-[3/1] w-full">
        {banner.image ? (
          <img src={banner.image} alt={banner.title} className="w-full h-full object-cover transition-opacity duration-500" />
        ) : (
          <Link to={banner.link} className="block w-full h-full">
            <div className="w-full h-full bg-gradient-to-br from-primary via-primary/85 to-accent flex items-center justify-center px-8">
              <h2 className="text-primary-foreground text-xl sm:text-3xl font-display font-bold text-center leading-snug drop-shadow-md">{banner.title}</h2>
            </div>
          </Link>
        )}

        {/* Tap zones — left half goes prev, right half goes next */}
        {banners.length > 1 && banner.image && (
          <>
            <button
              onClick={(e) => { e.preventDefault(); prev(); setPaused(true); setTimeout(() => setPaused(false), 3000); }}
              className="absolute inset-y-0 left-0 w-1/2 z-10 cursor-pointer"
              aria-label="আগের ব্যানার"
            />
            <button
              onClick={(e) => { e.preventDefault(); next(); setPaused(true); setTimeout(() => setPaused(false), 3000); }}
              className="absolute inset-y-0 right-0 w-1/2 z-10 cursor-pointer"
              aria-label="পরের ব্যানার"
            />
          </>
        )}
      </div>

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {banners.map((_, i) => (
            <button key={i} onClick={() => { setCurrent(i); setPaused(true); setTimeout(() => setPaused(false), 3000); }} className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-5 bg-white' : 'w-2 bg-white/50'}`} />
          ))}
        </div>
      )}
    </section>
  );
}
