import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStore } from '@/data/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Search, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';

export default function Shop() {
  const { products, categories, addToCart } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
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
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">All Products</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} products found</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." className="pl-9 rounded-full bg-muted/50 border-0" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <Button
              variant={!activeCategory ? 'default' : 'outline'}
              size="sm"
              className="rounded-full text-xs h-8"
              onClick={() => setCategory('')}
            >
              All
            </Button>
            {categories.map(c => (
              <Button
                key={c.id}
                variant={activeCategory === c.name ? 'default' : 'outline'}
                size="sm"
                className="rounded-full text-xs h-8"
                onClick={() => setCategory(c.name)}
              >
                {c.icon} {c.name}
              </Button>
            ))}
          </div>
        </div>

        {activeCategory && activeSubcategories.length > 0 && (
          <div className="flex gap-1.5 flex-wrap items-center">
            <SlidersHorizontal className="h-3 w-3 text-muted-foreground" />
            <Button
              variant={!activeSub ? 'default' : 'ghost'}
              size="sm"
              className="rounded-full text-[11px] h-7 px-3"
              onClick={() => setSubcategory('')}
            >
              All
            </Button>
            {activeSubcategories.map(sc => (
              <Button
                key={sc}
                variant={activeSub === sc ? 'default' : 'ghost'}
                size="sm"
                className="rounded-full text-[11px] h-7 px-3"
                onClick={() => setSubcategory(sc)}
              >
                {sc}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {filtered.map(p => {
          const cat = categories.find(c => c.name === p.category);
          return (
            <div key={p.id} className="group rounded-2xl border bg-card overflow-hidden hover:shadow-lg transition-all duration-300">
              <Link to={`/product/${p.id}`}>
                <div className="aspect-square bg-muted/50 flex items-center justify-center group-hover:bg-primary/5 transition-colors duration-300 relative">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <span className="text-4xl md:text-5xl group-hover:scale-110 transition-transform duration-500">{cat?.icon || '📦'}</span>
                  )}
                  {p.stock === 0 && (
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                      <span className="text-xs font-medium text-muted-foreground">Sold out</span>
                    </div>
                  )}
                  {p.stock > 0 && p.stock < 10 && (
                    <span className="absolute top-2 right-2 text-[9px] bg-destructive/90 text-destructive-foreground px-1.5 py-0.5 rounded-full">Low stock</span>
                  )}
                </div>
              </Link>
              <div className="p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{p.category} · {p.subcategory}</p>
                <Link to={`/product/${p.id}`}>
                  <h3 className="font-medium text-sm mt-0.5 line-clamp-1 group-hover:text-primary transition-colors">{p.name}</h3>
                </Link>
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{p.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-display font-bold text-primary">${p.price.toFixed(2)}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary"
                    onClick={() => { addToCart(p); toast.success(`Added: ${p.name}`); }}
                    disabled={p.stock === 0}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <p className="font-display text-lg">No products found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
