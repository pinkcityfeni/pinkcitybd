import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStore } from '@/data/store';
import { useLanguage } from '@/data/language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Search, SlidersHorizontal, Heart, Star } from 'lucide-react';
import { toast } from 'sonner';

function ProductCard({ product, catIcon, isWished, toggleWishlist, addToCart, t }: any) {
  const getProductRating = useStore(s => s.getProductRating);
  const rating = getProductRating(product.id);

  return (
    <div className="group rounded-2xl border bg-card overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-square bg-gradient-to-br from-secondary/50 via-muted/30 to-accent/10 flex items-center justify-center overflow-hidden relative">
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
          ) : (
            <span className="text-4xl md:text-5xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">{catIcon}</span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-xs font-semibold text-muted-foreground bg-card/80 px-3 py-1 rounded-full">{t('home.outOfStock')}</span>
            </div>
          )}
          {product.stock > 0 && product.stock < 10 && (
            <span className="absolute top-2 left-2 text-[9px] font-semibold bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full animate-pulse shadow-sm">
              🔥 {t('shop.lowStock')}
            </span>
          )}
        </div>
      </Link>
      <div className="p-3">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{product.category} · {product.subcategory}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-sm mt-1 line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
        </Link>

        {rating.count > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`h-3 w-3 ${s <= Math.round(rating.avg) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/20'}`} />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">({rating.count})</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-2.5">
          <span className="font-display font-bold text-primary text-lg">৳{product.price.toFixed(0)}</span>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 ${isWished ? 'bg-destructive/10 text-destructive' : 'hover:bg-primary/10 text-muted-foreground hover:text-primary'}`}
            >
              <Heart className={`h-3.5 w-3.5 transition-transform ${isWished ? 'fill-destructive scale-110' : 'hover:scale-110'}`} />
            </button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-all"
              onClick={() => { addToCart(product); toast.success(t('home.added', { name: product.name })); }}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  const products = useStore(s => s.products);
  const categories = useStore(s => s.categories);
  const addToCart = useStore(s => s.addToCart);
  const wishlist = useStore(s => s.wishlist);
  const toggleWishlist = useStore(s => s.toggleWishlist);
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const activeCategory = searchParams.get('category') || '';
  const activeSub = searchParams.get('sub') || '';

  const activeSubcategories = activeCategory
    ? categories.find(c => c.name === activeCategory)?.subcategories || []
    : [];

  const filtered = products.filter(p => {
    if (activeCategory && p.category !== activeCategory) return false;
    if (activeSub && p.subcategory !== activeSub) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const setCategory = (cat: string) => {
    if (cat) setSearchParams({ category: cat });
    else setSearchParams({});
  };

  const setSubcategory = (sub: string) => {
    if (sub) setSearchParams({ category: activeCategory, sub });
    else setSearchParams({ category: activeCategory });
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-bold">✨ {t('shop.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('shop.found', { n: filtered.length })}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('nav.search')}
              className="pl-10 rounded-full bg-card border-2 border-primary/10 focus:border-primary shadow-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <Button
              variant={!activeCategory ? 'default' : 'outline'}
              size="sm"
              className={`rounded-full text-xs h-8 ${!activeCategory ? 'shadow-md shadow-primary/20' : 'border-primary/20'}`}
              onClick={() => setCategory('')}
            >
              {t('shop.all')}
            </Button>
            {categories.map(c => (
              <Button
                key={c.id}
                variant={activeCategory === c.name ? 'default' : 'outline'}
                size="sm"
                className={`rounded-full text-xs h-8 ${activeCategory === c.name ? 'shadow-md shadow-primary/20' : 'border-primary/20 hover:border-primary/40'}`}
                onClick={() => setCategory(c.name)}
              >
                {c.image ? <img src={c.image} alt="" className="h-4 w-4 rounded-full object-cover inline-block mr-1" /> : c.icon} {c.name}
              </Button>
            ))}
          </div>
        </div>

        {activeCategory && activeSubcategories.length > 0 && (
          <div className="flex gap-1.5 flex-wrap items-center">
            <SlidersHorizontal className="h-3 w-3 text-primary" />
            <Button variant={!activeSub ? 'default' : 'ghost'} size="sm" className="rounded-full text-[11px] h-7 px-3" onClick={() => setSubcategory('')}>{t('shop.all')}</Button>
            {activeSubcategories.map(sc => (
              <Button key={sc} variant={activeSub === sc ? 'default' : 'ghost'} size="sm" className="rounded-full text-[11px] h-7 px-3" onClick={() => setSubcategory(sc)}>{sc}</Button>
            ))}
          </div>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
        {filtered.map(p => {
          const cat = categories.find(c => c.name === p.category);
          const isWished = wishlist.includes(p.id);
          return (
            <ProductCard
              key={p.id}
              product={p}
              catIcon={cat?.icon || '📦'}
              isWished={isWished}
              toggleWishlist={toggleWishlist}
              addToCart={addToCart}
              t={t}
            />
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-20 text-muted-foreground">
            <p className="text-5xl mb-3">🔍</p>
            <p className="font-display text-lg">{t('shop.noProducts')}</p>
            <p className="text-sm mt-1">{t('shop.changeFilter')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
