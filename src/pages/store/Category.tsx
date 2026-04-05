import { Link } from 'react-router-dom';
import { useStore } from '@/data/store';
import { ChevronRight } from 'lucide-react';

export default function Category() {
  const { categories, products } = useStore();

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl font-bold">All Categories</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse by category and subcategory</p>
      </div>

      <div className="space-y-5">
        {categories.map(c => {
          const catProducts = products.filter(p => p.category === c.name);
          return (
            <div key={c.id} className="rounded-2xl border bg-card p-5 hover:shadow-md transition-shadow">
              <Link
                to={`/shop?category=${encodeURIComponent(c.name)}`}
                className="flex items-center gap-3 mb-4 group"
              >
                <div className="h-12 w-12 rounded-2xl soft-gradient flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shrink-0">
                  {c.icon}
                </div>
                <div className="flex-1">
                  <h2 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">{c.name}</h2>
                  <p className="text-xs text-muted-foreground">{catProducts.length} products</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {c.subcategories.map(sc => {
                  const subProducts = catProducts.filter(p => p.subcategory === sc);
                  return (
                    <Link
                      key={sc}
                      to={`/shop?category=${encodeURIComponent(c.name)}&sub=${encodeURIComponent(sc)}`}
                      className="rounded-xl border bg-card p-3 hover:border-primary/30 hover:shadow-sm transition-all group"
                    >
                      <h3 className="font-medium text-sm group-hover:text-primary transition-colors">{sc}</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{subProducts.length} products</p>
                      {subProducts.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {subProducts.slice(0, 2).map(p => (
                            <span key={p.id} className="text-[9px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground truncate max-w-[90px]">
                              {p.name}
                            </span>
                          ))}
                          {subProducts.length > 2 && (
                            <span className="text-[9px] text-muted-foreground">+{subProducts.length - 2}</span>
                          )}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {categories.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">No categories yet</div>
        )}
      </div>
    </div>
  );
}
