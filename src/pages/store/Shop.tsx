import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStore } from '@/data/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Search } from 'lucide-react';

const EMOJI_MAP: Record<string, string> = {
  'Electronics': '🔌', 'Clothing': '👕', 'Food & Drinks': '🍵',
  'Home & Garden': '🌿', 'Sports': '🏃', 'Books': '📚',
};

export default function Shop() {
  const { products, categories, addToCart } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const activeCategory = searchParams.get('category') || '';

  const filtered = products.filter(p => {
    if (activeCategory && p.category !== activeCategory) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="page-header">All Products</h1>
      <p className="page-subheader mb-6">{filtered.length} products</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant={!activeCategory ? 'default' : 'outline'} size="sm" onClick={() => setSearchParams({})}>All</Button>
          {categories.map(c => (
            <Button key={c} variant={activeCategory === c ? 'default' : 'outline'} size="sm" onClick={() => setSearchParams({ category: c })}>
              {c}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="stat-card group flex flex-col">
            <Link to={`/product/${p.id}`}>
              <div className="aspect-square rounded-lg bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/5 transition-colors">
                <span className="text-5xl">{EMOJI_MAP[p.category] || '📦'}</span>
              </div>
            </Link>
            <p className="text-xs text-muted-foreground">{p.category}</p>
            <Link to={`/product/${p.id}`}>
              <h3 className="font-semibold text-sm mt-0.5 line-clamp-1 hover:text-primary">{p.name}</h3>
            </Link>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1 flex-1">{p.description}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="font-bold text-primary">${p.price.toFixed(2)}</span>
              <Button size="sm" variant="outline" onClick={() => addToCart(p)} disabled={p.stock === 0}>
                <ShoppingCart className="h-4 w-4 mr-1" />
                {p.stock > 0 ? 'Add' : 'Out'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
