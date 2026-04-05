import { Link } from 'react-router-dom';
import { useStore } from '@/data/store';

const EMOJI_MAP: Record<string, string> = {
  'Electronics': '🔌', 'Clothing': '👕', 'Food & Drinks': '🍵',
  'Home & Garden': '🌿', 'Sports': '🏃', 'Books': '📚',
};

export default function Categories() {
  const { categories, products } = useStore();

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="page-header">Categories</h1>
      <p className="page-subheader mb-6">Browse products by category</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(c => {
          const count = products.filter(p => p.category === c).length;
          return (
            <Link key={c} to={`/shop?category=${encodeURIComponent(c)}`} className="stat-card flex items-center gap-4 hover:border-primary/30 transition-colors">
              <span className="text-4xl">{EMOJI_MAP[c] || '📦'}</span>
              <div>
                <h3 className="font-semibold">{c}</h3>
                <p className="text-sm text-muted-foreground">{count} products</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
