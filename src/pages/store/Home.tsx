import { Link } from 'react-router-dom';
import { useStore } from '@/data/store';
import { ArrowRight, Zap, Truck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EMOJI_MAP: Record<string, string> = {
  'Electronics': '🔌', 'Clothing': '👕', 'Food & Drinks': '🍵',
  'Home & Garden': '🌿', 'Sports': '🏃', 'Books': '📚',
};

export default function Home() {
  const { products, categories } = useStore();
  const featured = products.slice(0, 4);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Shop Smarter,<br />
            <span className="text-primary">Live Better</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-8">
            Discover quality products at great prices. Fast shipping, easy returns, and reward points on every purchase.
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/shop">Browse Products <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/categories">Categories</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Truck, label: 'Free Shipping', desc: 'On orders over $50' },
            { icon: Shield, label: 'Secure Checkout', desc: 'Safe & encrypted' },
            { icon: Zap, label: 'Reward Points', desc: 'Earn on every purchase' },
          ].map(p => (
            <div key={p.label} className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <p.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">{p.label}</p>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="page-header mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map(c => (
            <Link
              key={c}
              to={`/shop?category=${encodeURIComponent(c)}`}
              className="stat-card flex flex-col items-center gap-2 text-center hover:border-primary/30 transition-colors"
            >
              <span className="text-3xl">{EMOJI_MAP[c] || '📦'}</span>
              <span className="text-sm font-medium">{c}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="page-header">Featured Products</h2>
          <Link to="/shop" className="text-sm text-primary font-medium hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map(p => (
            <Link key={p.id} to={`/product/${p.id}`} className="stat-card group">
              <div className="aspect-square rounded-lg bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/5 transition-colors">
                <span className="text-5xl">{EMOJI_MAP[p.category] || '📦'}</span>
              </div>
              <p className="text-xs text-muted-foreground">{p.category}</p>
              <h3 className="font-semibold text-sm mt-0.5 line-clamp-1">{p.name}</h3>
              <p className="font-bold text-primary mt-1">${p.price.toFixed(2)}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
