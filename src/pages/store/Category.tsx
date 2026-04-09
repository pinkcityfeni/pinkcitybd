import { Link } from 'react-router-dom';
import { useStore } from '@/data/store';
import { useLanguage } from '@/data/language';
import { ChevronRight } from 'lucide-react';

export default function Category() {
  const categories = useStore(s => s.categories);
  const products = useStore(s => s.products);
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <h1 className="font-display text-2xl font-bold mb-1">{t('category.title')}</h1>
      <p className="text-xs text-muted-foreground mb-6">{t('shop.found', { n: products.length })}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map(c => {
          const catProducts = products.filter(p => p.category === c.name);
          return (
            <div key={c.id} className="rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all duration-300 group">
              <Link
                to={`/shop?category=${encodeURIComponent(c.name)}`}
                className="flex items-center gap-3 p-4 border-b bg-secondary/30 group-hover:bg-secondary/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center text-lg shrink-0 overflow-hidden border">
                  {c.image ? <img src={c.image} alt={c.name} className="h-full w-full object-cover" /> : c.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-sm truncate" style={{ fontFamily: 'DM Sans, sans-serif' }}>{c.name}</h2>
                  <p className="text-[10px] text-muted-foreground">{t('category.products', { n: catProducts.length })}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </Link>

              <div className="p-2">
                {c.subcategories.length > 0 ? (
                  <div className="space-y-0.5">
                    {c.subcategories.map(sc => {
                      const subCount = catProducts.filter(p => p.subcategory === sc).length;
                      return (
                        <Link
                          key={sc}
                          to={`/shop?category=${encodeURIComponent(c.name)}&sub=${encodeURIComponent(sc)}`}
                          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted transition-colors group/sub text-sm"
                        >
                          <span className="group-hover/sub:text-primary transition-colors">{sc}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{subCount}</span>
                            <ChevronRight className="h-3 w-3 text-muted-foreground group-hover/sub:text-primary transition-colors" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-3">{t('category.noSub')}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-5xl mb-3">📦</p>
          <p className="font-display text-lg">{t('category.noCat')}</p>
        </div>
      )}
    </div>
  );
}
