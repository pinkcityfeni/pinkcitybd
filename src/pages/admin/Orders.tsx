import { useState } from 'react';
import { useStore, Order } from '@/data/store';
import { useLanguage } from '@/data/language';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MapPin, Phone, Mail, ChevronDown, ChevronUp, Wallet, Banknote, Smartphone, CreditCard, Building2, Truck, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const PAYMENT_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  cod: { label: 'Cash on Delivery', icon: <Banknote className="h-3.5 w-3.5" /> },
  bkash: { label: 'bKash', icon: <Smartphone className="h-3.5 w-3.5" /> },
  nagad: { label: 'Nagad', icon: <Smartphone className="h-3.5 w-3.5" /> },
  card: { label: 'Card', icon: <CreditCard className="h-3.5 w-3.5" /> },
  bank: { label: 'Bank Transfer', icon: <Building2 className="h-3.5 w-3.5" /> },
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  paid: 'bg-success/10 text-success border-success/20',
};

const STATUS_COLORS: Record<Order['status'], string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  processing: 'bg-info/10 text-info border-info/20',
  completed: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function Orders() {
  const orders = useStore(s => s.orders);
  const updateOrderStatus = useStore(s => s.updateOrderStatus);
  const deleteOrder = useStore(s => s.deleteOrder);
  const { t } = useLanguage();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const advance = (o: Order) => {
    const next: Record<string, Order['status']> = { pending: 'processing', processing: 'completed' };
    const ns = next[o.status];
    if (ns) { updateOrderStatus(o.id, ns); toast.success(`Order ${o.id} → ${ns}`); }
  };

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-xl font-bold">{t('order.title')}</h1>
      <p className="text-sm text-muted-foreground mb-6">{t('order.nOrders', { n: orders.length })}</p>

      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">{t('order.noOrders')}</p>
      ) : (
        <div className="space-y-3">
          {orders.map(o => {
            const expanded = expandedId === o.id;
            return (
              <div key={o.id} className="rounded-xl border bg-card overflow-hidden">
                <button className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors" onClick={() => setExpandedId(expanded ? null : o.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs">{o.id}</span>
                      <Badge variant="outline" className="text-[10px]">{o.type.toUpperCase()}</Badge>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                      {o.paymentMethod && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                          {PAYMENT_LABELS[o.paymentMethod]?.icon} {PAYMENT_LABELS[o.paymentMethod]?.label}
                        </span>
                      )}
                      {o.paymentStatus && (
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${PAYMENT_STATUS_COLORS[o.paymentStatus] || ''}`}>
                          {o.paymentStatus === 'paid' ? t('order.paid') : t('order.unpaid')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      <span className="font-medium">{o.customerName || 'Guest'}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground text-xs">{new Date(o.date).toLocaleString()}</span>
                    </div>
                  </div>
                  <span className="font-bold text-primary">৳{o.total.toFixed(0)}</span>
                  {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>

                {expanded && (
                  <div className="border-t p-4 space-y-4 animate-fade-in">
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      {o.customerPhone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" /> {o.customerPhone}</div>}
                      {o.customerEmail && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" /> {o.customerEmail}</div>}
                      {o.deliveryAddress && <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2"><MapPin className="h-3.5 w-3.5 shrink-0" /> {o.deliveryAddress}</div>}
                      {o.deliveryZone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Truck className="h-3.5 w-3.5 shrink-0" />
                          <span>{o.deliveryZone === 'feni' ? t('order.feni') : t('order.outsideFeni')} — ৳{o.deliveryCharge || 0}</span>
                        </div>
                      )}
                      {o.paymentMethod && (
                        <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                          <Wallet className="h-3.5 w-3.5 shrink-0" />
                          <span>{PAYMENT_LABELS[o.paymentMethod]?.label || o.paymentMethod}</span>
                          {o.paymentStatus && (
                            <span className={`ml-1 inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium border ${PAYMENT_STATUS_COLORS[o.paymentStatus]}`}>
                              {o.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('order.items')}</p>
                      {o.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm py-1">
                          <span>{item.product.name} × {item.quantity}</span>
                          <span className="font-medium">৳{(item.product.price * item.quantity).toFixed(0)}</span>
                        </div>
                      ))}
                      {o.deliveryCharge !== undefined && o.deliveryCharge > 0 && (
                        <div className="flex justify-between text-sm py-1">
                          <span className="text-muted-foreground">{t('order.deliveryCharge')}</span>
                          <span>৳{o.deliveryCharge}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-xs text-muted-foreground">
                        {o.pointsEarned ? t('order.pointsEarned', { n: o.pointsEarned }) : ''}
                      </div>
                       <div className="flex gap-2">
                         {o.status !== 'completed' && o.status !== 'cancelled' && (
                           <>
                             <Button size="sm" variant="outline" onClick={() => { updateOrderStatus(o.id, 'cancelled'); toast.success(t('order.cancelled')); }}>{t('order.cancel')}</Button>
                             <Button size="sm" onClick={() => advance(o)}>{o.status === 'pending' ? t('order.process') : t('order.complete')}</Button>
                           </>
                         )}
                         <Button size="sm" variant="destructive" onClick={() => setDeleteId(o.id)}>
                           <Trash2 className="h-3.5 w-3.5 mr-1" /> ডিলিট
                         </Button>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>অর্ডার ডিলিট করবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              এই অর্ডারটি স্থায়ীভাবে মুছে যাবে। এটি আর ফিরিয়ে আনা যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (deleteId) { deleteOrder(deleteId); toast.success('অর্ডার ডিলিট হয়েছে'); setDeleteId(null); } }}>
              ডিলিট করুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
