import { Link } from 'react-router-dom';
import { useStore } from '@/data/store';

const EMOJI_MAP: Record<string, string> = {
  'Electronics': '🔌', 'Clothing': '👕', 'Food & Drinks': '🍵',
  'Home & Garden': '🌿', 'Sports': '🏃', 'Books': '📚',
};

export default function Category() {
  const { categories, products } = useStore();

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="page-header">All Categories</h1>
      <p className="page-subheader mb-8">Find exactly what you're looking for</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map(c => {
          const catProducts = products.filter(p => p.category === c);
          const count = catProducts.length;
          const minPrice = Math.min(...catProducts.map(p => p.price));
          const maxPrice = Math.max(...catProducts.map(p => p.price));
          return (
            <Link
              key={c}
              to={`/shop?category=${encodeURIComponent(c)}`}
              className="stat-card group hover:border-primary/30 transition-all hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-xl bg-primary/5 flex items-center justify-center text-3xl group-hover:bg-primary/10 transition-colors shrink-0">
                  {EMOJI_MAP[c] || '📦'}
                </div>
                <div>
                  <h3 className="font-semibold text-base group-hover:text-primary transition-colors">{c}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{count} products</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ${minPrice.toFixed(2)} — ${maxPrice.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 mt-3">
                {catProducts.slice(0, 3).map(p => (
                  <span key={p.id} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground truncate max-w-[120px]">
                    {p.name}
                  </span>
                ))}
                {count > 3 && <span className="text-xs text-muted-foreground">+{count - 3} more</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
