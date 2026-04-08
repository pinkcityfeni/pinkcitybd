import { Link } from 'react-router-dom';
import { useStore } from '@/data/store';
import { ShoppingCart, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState, useEffect, useMemo, useCallback } from 'react';

export default function Home() {
  const { products, categories, addToCart, banners } = useStore();
  const activeBanners = banners.filter(b => b.active);
  const shuffled = useMemo(() => [...products].sort(() => Math.random() - 0.5), [products]);

  return (
    <div className="animate-fade-in">
      {/* Hero Banner Slider */}
      {activeBanners.length > 0 && <BannerSlider banners={activeBanners} />}

      {/* Category Scrollable Icons */}
      <section className="border-b bg-card">
        <div className="container mx-auto px-2 py-3">
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            {categories.map(c => (
              <Link
                key={c.id}
                to={`/shop?category=${encodeURIComponent(c.name)}`}
                className="flex flex-col items-center gap-1.5 min-w-[64px] group"
              >
                <div className="h-12 w-12 rounded-2xl bg-primary/8 flex items-center justify-center group-hover:bg-primary/15 group-hover:scale-105 transition-all duration-200">
                  <span className="text-2xl">{c.icon}</span>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-primary text-center leading-tight whitespace-nowrap">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* All Products Grid */}
      <section className="container mx-auto px-3 py-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold">Just For You</h2>
          <Link to="/shop" className="text-xs text-primary font-medium flex items-center gap-0.5">
            View All <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
          {shuffled.map(p => {
            const cat = categories.find(c => c.name === p.category);
            return (
              <div key={p.id} className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all duration-200">
                <Link to={`/product/${p.id}`}>
                  <div className="aspect-square bg-muted/30 flex items-center justify-center relative overflow-hidden">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{cat?.icon || '📦'}</span>
                    )}
                    {p.stock < 5 && p.stock > 0 && (
                      <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full font-medium">
                        Only {p.stock} left
                      </span>
                    )}
                    {p.stock === 0 && (
                      <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                        <span className="text-xs font-medium text-muted-foreground">Out of Stock</span>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-2.5">
                  <Link to={`/product/${p.id}`}>
                    <h3 className="text-xs font-medium line-clamp-2 leading-snug group-hover:text-primary transition-colors">{p.name}</h3>
                  </Link>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="font-display font-bold text-sm text-primary">৳{p.price.toFixed(0)}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 rounded-full hover:bg-primary/10 hover:text-primary"
                      onClick={() => { addToCart(p); toast.success(`Added: ${p.name}`); }}
                      disabled={p.stock === 0}
                    >
                      <ShoppingCart className="h-3 w-3" />
                    </Button>
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

  const next = useCallback(() => setCurrent(i => (i + 1) % banners.length), [banners.length]);
  const prev = useCallback(() => setCurrent(i => (i - 1 + banners.length) % banners.length), [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [banners.length, next]);

  const banner = banners[current];

  return (
    <section className="relative w-full overflow-hidden bg-muted/30">
      <Link to={banner.link} className="block">
        <div className="relative aspect-[21/9] sm:aspect-[3/1] w-full">
          {banner.image ? (
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary via-primary/80 to-accent flex items-center justify-center px-6">
              <h2 className="text-primary-foreground text-lg sm:text-2xl md:text-3xl font-display font-bold text-center leading-snug">
                {banner.title}
              </h2>
            </div>
          )}
        </div>
      </Link>

      {/* Nav arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center hover:bg-background/90 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center hover:bg-background/90 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-5 bg-primary-foreground' : 'w-1.5 bg-primary-foreground/50'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function CountdownTimer() {
  const [time, setTime] = useState({ h: 3, m: 45, s: 25 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(t => {
        let { h, m, s } = t;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-0.5 ml-1">
      {[time.h, time.m, time.s].map((v, i) => (
        <span key={i} className="flex items-center gap-0.5">
          <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1 py-0.5 rounded">{pad(v)}</span>
          {i < 2 && <span className="text-[10px] font-bold text-destructive">:</span>}
        </span>
      ))}
    </div>
  );
}

function FlashProductCard({ product: p, categories, addToCart }: {
  product: import('@/data/store').Product;
  categories: import('@/data/store').Category[];
  addToCart: (product: import('@/data/store').Product, qty?: number) => void;
}) {
  const cat = categories.find(c => c.name === p.category);
  const discount = Math.floor(Math.random() * 30 + 10);

  return (
    <div className="min-w-[130px] max-w-[140px] rounded-xl border bg-card overflow-hidden group flex-shrink-0">
      <Link to={`/product/${p.id}`}>
        <div className="aspect-square bg-muted/30 flex items-center justify-center relative overflow-hidden">
          {p.image ? (
            <img src={p.image} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <span className="text-3xl">{cat?.icon || '📦'}</span>
          )}
          <span className="absolute top-1 left-1 text-[9px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-sm font-bold">
            -{discount}%
          </span>
        </div>
      </Link>
      <div className="p-2">
        <h3 className="text-[11px] line-clamp-1 font-medium">{p.name}</h3>
        <div className="flex items-center gap-1 mt-1">
          <span className="font-display font-bold text-xs text-primary">৳{p.price.toFixed(0)}</span>
        </div>
        {p.stock < 5 && p.stock > 0 && (
          <p className="text-[9px] text-destructive font-medium mt-0.5">Only {p.stock} left</p>
        )}
      </div>
    </div>
  );
}
