import { Link } from 'react-router-dom';
import { useStore } from '@/data/store';
import { ShoppingCart, ChevronRight } from 'lucide-react';
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
      <section className="bg-card border-b">
        <div className="px-3 py-2.5">
          <div className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            {categories.map(c => (
              <Link
                key={c.id}
                to={`/shop?category=${encodeURIComponent(c.name)}`}
                className="flex flex-col items-center gap-1 min-w-[56px] group"
              >
                <div className="h-11 w-11 rounded-full bg-primary/8 flex items-center justify-center group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-200 shadow-sm">
                  <span className="text-xl">{c.icon}</span>
                </div>
                <span className="text-[9px] font-medium text-muted-foreground group-hover:text-primary text-center leading-tight whitespace-nowrap">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
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
                      <span className="absolute bottom-1 left-1 text-[8px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full font-bold">
                        মাত্র {p.stock}টি বাকি
                      </span>
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

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [banners.length, next]);

  const banner = banners[current];

  return (
    <section className="relative w-full overflow-hidden">
      <Link to={banner.link} className="block">
        <div className="relative aspect-[2/1] sm:aspect-[3/1] w-full">
          {banner.image ? (
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary via-primary/85 to-accent flex items-center justify-center px-8">
              <h2 className="text-primary-foreground text-xl sm:text-3xl font-display font-bold text-center leading-snug drop-shadow-md">
                {banner.title}
              </h2>
            </div>
          )}
        </div>
      </Link>

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-5 bg-white' : 'w-2 bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
