import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { useStore } from '@/data/store';
import { useLanguage } from '@/data/language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Search, SlidersHorizontal, Heart, Star } from 'lucide-react';
import { toast } from 'sonner';
import { usePublicProducts, useCategories, useProductRating } from '@/hooks/useSupabaseData';

function ProductCard({ product, catIcon, isWished, toggleWishlist, addToCart, t }: any) {
  const rating = useProductRating(product.id);
  return (
    <div className="group product-card relative">
      <button onClick={() => toggleWishlist(product.id)} className={`absolute top-2.5 right-2.5 z-10 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 ${isWished ? 'bg-destructive/10 text-destructive' : 'bg-background/80 backdrop-blur-sm text-muted-foreground opacity-0 group-hover:opacity-100 hover:scale-110'}`}>
        <Heart className={`h-3.5 w-3.5 ${isWished ? 'fill-destructive' : ''}`} />
      </button>
      {product.stock === 0 && <span className="absolute top-2.5 left-2.5 z-10 text-[9px] font-semibold bg-foreground text-background px-2 py-0.5 rounded">{t('home.outOfStock')}</span>}
      {product.stock > 0 && product.stock < 10 && <span className="absolute top-2.5 left-2.5 z-10 text-[9px] font-semibold bg-destructive text-destructive-foreground px-2 py-0.5 rounded">{t('shop.lowStock')}</span>}
      <Link to={`/product/${product.id}`}>
        <div className="aspect-square bg-secondary/30 flex items-center justify-center overflow-hidden">
          {product.image ? <img src={product.image} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" /> : <span className="text-4xl md:text-5xl group-hover:scale-110 transition-transform duration-500">{catIcon}</span>}
        </div>
      </Link>
      <div className="p-3">
        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">{product.category}</p>
        <Link to={`/product/${product.id}`}><h3 className="font-medium text-sm mt-0.5 line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3></Link>
        {rating.count > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`h-3 w-3 ${s <= Math.round(rating.avg) ? 'fill-warning text-warning' : 'text-border'}`} />)}</div>
            <span className="text-[10px] text-muted-foreground">({rating.count})</span>
          </div>
        )}
        <div className="flex items-center justify-between mt-2.5">
          <span className="font-bold text-base text-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>৳{product.price.toFixed(0)}</span>
          <Button size="sm" className="h-8 rounded-lg text-[10px] px-3 font-semibold" onClick={() => { addToCart(product); toast.success(t('home.added', { name: product.name })); }} disabled={product.stock === 0}>
            <ShoppingCart className="h-3 w-3 mr-1" /> {t('home.addBtn')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  const { data: products = [] } = usePublicProducts();
  const { data: categories = [] } = useCategories();
  const addToCart = useStore(s => s.addToCart);
  const wishlist = useStore(s => s.wishlist);
  const toggleWishlist = useStore(s => s.toggleWishlist);
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const activeCategory = searchParams.get('category') || '';
  const activeSub = searchParams.get('sub') || '';
  const activeSubcategories = activeCategory ? categories.find(c => c.name === activeCategory)?.subcategories || [] : [];
  const filtered = products.filter(p => {
    if (activeCategory && p.category !== activeCategory) return false;
    if (activeSub && p.subcategory !== activeSub) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const setCategory = (cat: string) => { if (cat) setSearchParams({ category: cat }); else setSearchParams({}); };
  const setSubcategory = (sub: string) => { if (sub) setSearchParams({ category: activeCategory, sub }); else setSearchParams({ category: activeCategory }); };

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold">{t('shop.title')}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{t('shop.found', { n: filtered.length })}</p>
      </div>
      <div className="space-y-3 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('nav.search')} className="pl-10 rounded-lg h-10 border focus-visible:ring-1 focus-visible:ring-primary" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <Button variant={!activeCategory ? 'default' : 'outline'} size="sm" className="rounded-lg text-xs h-8" onClick={() => setCategory('')}>{t('shop.all')}</Button>
          {categories.map(c => (
            <Button key={c.id} variant={activeCategory === c.name ? 'default' : 'outline'} size="sm" className="rounded-lg text-xs h-8" onClick={() => setCategory(c.name)}>
              {c.image ? <img src={c.image} alt="" className="h-4 w-4 rounded object-cover inline-block mr-1" /> : <span className="mr-1">{c.icon}</span>}{c.name}
            </Button>
          ))}
        </div>
        {activeCategory && activeSubcategories.length > 0 && (
          <div className="flex gap-1.5 flex-wrap items-center">
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            <Button variant={!activeSub ? 'default' : 'ghost'} size="sm" className="rounded-lg text-[11px] h-7 px-3" onClick={() => setSubcategory('')}>{t('shop.all')}</Button>
            {activeSubcategories.map(sc => <Button key={sc} variant={activeSub === sc ? 'default' : 'ghost'} size="sm" className="rounded-lg text-[11px] h-7 px-3" onClick={() => setSubcategory(sc)}>{sc}</Button>)}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((p, i) => {
          const cat = categories.find(c => c.name === p.category);
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: (i % 2) * 0.08 }}
            >
              <ProductCard product={p} catIcon={cat?.icon || '📦'} isWished={wishlist.includes(p.id)} toggleWishlist={toggleWishlist} addToCart={addToCart} t={t} />
            </motion.div>
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
