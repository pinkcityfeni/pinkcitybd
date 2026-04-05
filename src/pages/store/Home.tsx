import { Link } from 'react-router-dom';
import { useStore } from '@/data/store';
import { ArrowRight, Zap, Truck, Shield, ShoppingCart, Sparkles, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Home() {
  const { products, categories, addToCart } = useStore();
  const featured = products.slice(0, 4);
  const newArrivals = products.slice(4, 8);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden py-16 md:py-24">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full mb-6">
            <Sparkles className="h-3 w-3" /> New Collection Available
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 leading-tight">
            Elegance in<br />
            <span className="text-primary">Every Detail</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-md mx-auto mb-8 leading-relaxed">
            Discover curated jewelry & cosmetics that celebrate your unique beauty. Earn rewards with every purchase.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button asChild size="lg" className="rounded-full px-6 shadow-lg shadow-primary/20">
              <Link to="/shop">Shop Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-6">
              <Link to="/category">Explore Categories</Link>
            </Button>
          </div>
        </div>
        {/* Decorative blobs */}
        <div className="absolute top-10 -left-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 -right-20 w-72 h-72 rounded-full bg-accent/5 blur-3xl" />
      </section>

      {/* Perks */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Truck, label: 'Free Shipping', desc: 'On orders over $50' },
            { icon: Shield, label: 'Secure Checkout', desc: 'Guest or account' },
            { icon: Gift, label: 'Earn Points', desc: '1 point per $1 spent' },
          ].map(p => (
            <div key={p.label} className="flex items-center gap-3 px-2">
              <div className="h-9 w-9 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                <p.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-xs">{p.label}</p>
                <p className="text-[11px] text-muted-foreground">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl font-bold mb-2">Shop by Category</h2>
          <p className="text-sm text-muted-foreground">Find exactly what you're looking for</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {categories.map(c => (
            <Link
              key={c.id}
              to={`/shop?category=${encodeURIComponent(c.name)}`}
              className="group rounded-2xl border bg-card p-5 flex flex-col items-center gap-2 text-center hover:border-primary/30 hover:shadow-md transition-all duration-300"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{c.icon}</span>
              <span className="font-display font-medium text-sm">{c.name}</span>
              <span className="text-[11px] text-muted-foreground">{c.subcategories.length} types</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="soft-gradient py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold">Featured</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Handpicked for you</p>
            </div>
            <Link to="/shop" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ProductGrid products={featured} categories={categories} addToCart={addToCart} />
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold">New Arrivals</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Just dropped this week</p>
          </div>
          <Link to="/shop" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <ProductGrid products={newArrivals} categories={categories} addToCart={addToCart} />
      </section>
    </div>
  );
}

function ProductGrid({ products, categories, addToCart }: {
  products: import('@/data/store').Product[];
  categories: import('@/data/store').Category[];
  addToCart: (product: import('@/data/store').Product, qty?: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {products.map(p => {
        const cat = categories.find(c => c.name === p.category);
        return (
          <div key={p.id} className="group rounded-2xl border bg-card overflow-hidden hover:shadow-lg transition-all duration-300">
            <Link to={`/product/${p.id}`}>
              <div className="aspect-square bg-muted/50 flex items-center justify-center group-hover:bg-primary/5 transition-colors duration-300 relative overflow-hidden">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <span className="text-4xl md:text-5xl group-hover:scale-110 transition-transform duration-500">{cat?.icon || '📦'}</span>
                )}
                {p.stock < 10 && p.stock > 0 && (
                  <span className="absolute top-2 right-2 text-[9px] bg-destructive/90 text-destructive-foreground px-1.5 py-0.5 rounded-full">Low stock</span>
                )}
              </div>
            </Link>
            <div className="p-3 md:p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{p.category}</p>
              <Link to={`/product/${p.id}`}>
                <h3 className="font-medium text-sm mt-0.5 line-clamp-1 group-hover:text-primary transition-colors">{p.name}</h3>
              </Link>
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
    </div>
  );
}
