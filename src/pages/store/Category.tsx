import { Link } from 'react-router-dom';
import { useStore } from '@/data/store';
import { useLanguage } from '@/data/language';
import { ChevronRight, Grid3X3 } from 'lucide-react';

export default function Category() {
  const categories = useStore(s => s.categories);
  const products = useStore(s => s.products);
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <Grid3X3 className="h-5 w-5 text-primary" />
        <h1 className="font-display text-xl font-bold">{t('category.title')}</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(c => {
          const catProducts = products.filter(p => p.category === c.name);
          return (
            <div key={c.id} className="rounded-2xl border bg-card overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <Link
                to={`/shop?category=${encodeURIComponent(c.name)}`}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b group-hover:from-primary/10 group-hover:to-primary/15 transition-colors"
              >
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                  {c.image ? <img src={c.image} alt={c.name} className="h-full w-full object-cover" /> : c.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-display font-semibold text-base truncate">{c.name}</h2>
                  <p className="text-[11px] text-muted-foreground">{t('category.products', { n: catProducts.length })}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </Link>

              <div className="p-3">
                {c.subcategories.length > 0 ? (
                  <div className="space-y-0.5">
                    {c.subcategories.map(sc => {
                      const subCount = catProducts.filter(p => p.subcategory === sc).length;
                      return (
                        <Link
                          key={sc}
                          to={`/shop?category=${encodeURIComponent(c.name)}&sub=${encodeURIComponent(sc)}`}
                          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-primary/5 transition-colors group/sub"
                        >
                          <span className="text-sm group-hover/sub:text-primary transition-colors">{sc}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{subCount}</span>
                            <ChevronRight className="h-3 w-3 text-muted-foreground group-hover/sub:text-primary transition-colors" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-3 italic">{t('category.noSub')}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Grid3X3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-display text-lg">{t('category.noCat')}</p>
        </div>
      )}
    </div>
  );
}
