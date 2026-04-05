import { Link } from 'react-router-dom';
import { useStore } from '@/data/store';
import { ChevronRight } from 'lucide-react';

export default function Category() {
  const { categories, products } = useStore();

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="page-header">All Categories</h1>
      <p className="page-subheader mb-8">Browse by category and subcategory</p>

      <div className="space-y-6">
        {categories.map(c => {
          const catProducts = products.filter(p => p.category === c.name);
          return (
            <div key={c.id} className="stat-card">
              {/* Category header */}
              <Link
                to={`/shop?category=${encodeURIComponent(c.name)}`}
                className="flex items-center gap-3 mb-4 group"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center text-2xl group-hover:bg-primary/10 transition-colors shrink-0">
                  {c.icon}
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-lg group-hover:text-primary transition-colors">{c.name}</h2>
                  <p className="text-sm text-muted-foreground">{catProducts.length} products</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              </Link>

              {/* Subcategories */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {c.subcategories.map(sc => {
                  const subProducts = catProducts.filter(p => p.subcategory === sc);
                  return (
                    <Link
                      key={sc}
                      to={`/shop?category=${encodeURIComponent(c.name)}&sub=${encodeURIComponent(sc)}`}
                      className="rounded-xl border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all group"
                    >
                      <h3 className="font-medium text-sm group-hover:text-primary transition-colors">{sc}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{subProducts.length} products</p>
                      {subProducts.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {subProducts.slice(0, 2).map(p => (
                            <span key={p.id} className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground truncate max-w-[100px]">
                              {p.name}
                            </span>
                          ))}
                          {subProducts.length > 2 && (
                            <span className="text-[10px] text-muted-foreground">+{subProducts.length - 2}</span>
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
          <div className="text-center py-12 text-muted-foreground">No categories yet</div>
        )}
      </div>
    </div>
  );
}
