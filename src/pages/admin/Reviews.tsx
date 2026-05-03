import { useState } from 'react';
import { useReviews, useProducts, useApproveReview, useDeleteReview } from '@/hooks/useSupabaseData';
import { useLanguage } from '@/data/language';
import { Star, Check, X, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

type Filter = 'pending' | 'approved' | 'all';

export default function Reviews() {
  const { data: reviews = [] } = useReviews();
  const { data: products = [] } = useProducts();
  const { t, locale } = useLanguage();
  const approveMut = useApproveReview();
  const deleteMut = useDeleteReview();
  const [filter, setFilter] = useState<Filter>('pending');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const pendingCount = reviews.filter(r => !r.approved).length;
  const approvedCount = reviews.filter(r => r.approved).length;
  const filtered = reviews.filter(r =>
    filter === 'all' ? true : filter === 'pending' ? !r.approved : r.approved
  );

  const handleApprove = async (id: string, approved: boolean) => {
    try {
      await approveMut.mutateAsync({ id, approved });
      toast.success(approved ? 'Review অনুমোদিত হয়েছে ✓' : 'Review pending করা হয়েছে');
    } catch {
      toast.error('পরিবর্তন করা যায়নি');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMut.mutateAsync(deleteId);
      toast.success('Review delete হয়েছে');
    } catch {
      toast.error('Delete করা যায়নি');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 animate-fade-in">
      <h1 className="page-header">{t('review.title')}</h1>
      <p className="page-subheader mb-4">
        {t('review.nReviews', { n: reviews.length })}
        {pendingCount > 0 && (
          <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
            <Clock className="h-3 w-3" /> {pendingCount} pending
          </span>
        )}
      </p>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {([
          { key: 'pending', label: `Pending (${pendingCount})` },
          { key: 'approved', label: `Approved (${approvedCount})` },
          { key: 'all', label: `All (${reviews.length})` },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          {filter === 'pending' ? 'কোনো pending review নেই' : t('review.noReviews')}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const product = products.find(p => p.id === r.productId);
            return (
              <div key={r.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{r.customerName}</p>
                      {r.approved ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-700 dark:text-green-400">
                          <Check className="h-2.5 w-2.5" /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400">
                          <Clock className="h-2.5 w-2.5" /> Pending
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{product?.name || 'Unknown Product'}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(r.date).toLocaleDateString(locale)}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-3 break-words">{r.comment}</p>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  {!r.approved ? (
                    <Button
                      size="sm"
                      onClick={() => handleApprove(r.id, true)}
                      disabled={approveMut.isPending}
                      className="h-8 text-xs gap-1"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApprove(r.id, false)}
                      disabled={approveMut.isPending}
                      className="h-8 text-xs gap-1"
                    >
                      <Clock className="h-3.5 w-3.5" /> Unapprove
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteId(r.id)}
                    disabled={deleteMut.isPending}
                    className="h-8 text-xs gap-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Review ডিলিট করবেন?</AlertDialogTitle>
            <AlertDialogDescription>এই review টি ডিলিট করা হবে। এই কাজ আর ফেরানো যাবে না।</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={confirmDelete}>ডিলিট করুন</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
