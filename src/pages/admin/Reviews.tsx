import { useStore } from '@/data/store';
import { useLanguage } from '@/data/language';
import { Star } from 'lucide-react';

export default function Reviews() {
  const reviews = useStore(s => s.reviews);
  const products = useStore(s => s.products);
  const { t } = useLanguage();

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="page-header">{t('review.title')}</h1>
      <p className="page-subheader mb-6">{t('review.nReviews', { n: reviews.length })}</p>

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">{t('review.noReviews')}</p>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => {
            const product = products.find(p => p.id === r.productId);
            return (
              <div key={r.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{r.customerName}</p>
                    <p className="text-xs text-muted-foreground">{product?.name || 'Unknown Product'}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{r.comment}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
