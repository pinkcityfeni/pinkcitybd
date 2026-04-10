import { useState, useRef } from 'react';
import { useStore } from '@/data/store';
import { useLanguage } from '@/data/language';
import type { PaymentMethod, Order } from '@/data/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';
import { Printer, Eye, X } from 'lucide-react';
import { toast } from 'sonner';
import POSInvoice from '@/components/pos/POSInvoice';

export default function POSSalesHistory() {
  const allOrders = useStore(s => s.orders);
  const { t } = useLanguage();
  const orders = useMemo(() => allOrders.filter(o => o.type === 'pos'), [allOrders]);
  const totalRev = useMemo(() => orders.reduce((s, o) => s + o.total, 0), [orders]);
  const totalCost = useMemo(() => orders.reduce((s, o) => s + o.items.reduce((c, i) => c + i.product.buyingPrice * i.quantity, 0), 0), [orders]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const getMethodLabel = (m: PaymentMethod): string => {
    const map: Record<PaymentMethod, string> = {
      cash: t('pos.cash'), cod: t('pos.cash'), bkash: t('pos.bkash'),
      nagad: t('pos.nagad'), bank: t('pos.bank'),
    };
    return map[m] || m;
  };

  const handlePrint = () => {
    if (!invoiceRef.current || !selectedOrder) return;
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) { toast.error(t('pos.popupBlocked')); return; }
    printWindow.document.write(`<html><head><title>Invoice - ${selectedOrder.id}</title><style>body{margin:0;font-family:monospace;}</style></head><body>${invoiceRef.current.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className={`flex-1 p-6 overflow-auto ${selectedOrder ? 'hidden md:block' : ''}`}>
        <h1 className="text-xl font-bold mb-1">{t('posHistory.title')}</h1>
        <p className="text-sm opacity-60 mb-6">{t('posHistory.nTransactions', { n: orders.length })}</p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="pos-panel">
            <p className="text-xs opacity-50">{t('posHistory.totalRevenue')}</p>
            <p className="text-xl font-bold text-primary">৳{totalRev.toFixed(0)}</p>
          </div>
          <div className="pos-panel">
            <p className="text-xs opacity-50">{t('posHistory.totalProfit')}</p>
            <p className="text-xl font-bold text-success">৳{(totalRev - totalCost).toFixed(0)}</p>
          </div>
          <div className="pos-panel">
            <p className="text-xs opacity-50">{t('posHistory.transactions')}</p>
            <p className="text-xl font-bold">{orders.length}</p>
          </div>
        </div>

        <div className="pos-panel overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left opacity-60" style={{ borderColor: 'hsl(var(--pos-border))' }}>
                <th className="pb-3 font-medium">{t('posHistory.orderId')}</th>
                <th className="pb-3 font-medium">{t('posHistory.date')}</th>
                <th className="pb-3 font-medium">{t('posHistory.items')}</th>
                <th className="pb-3 font-medium text-right">{t('posHistory.total')}</th>
                <th className="pb-3 font-medium">{t('posHistory.payment')}</th>
                <th className="pb-3 font-medium text-right">{t('posHistory.profit')}</th>
                <th className="pb-3 font-medium">{t('posHistory.status')}</th>
                <th className="pb-3 font-medium text-center">{t('posHistory.invoice')}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const cost = o.items.reduce((s, i) => s + i.product.buyingPrice * i.quantity, 0);
                return (
                  <tr key={o.id} className={`border-b last:border-0 cursor-pointer transition-colors hover:bg-primary/5 ${selectedOrder?.id === o.id ? 'bg-primary/10' : ''}`} style={{ borderColor: 'hsl(var(--pos-border))' }} onClick={() => setSelectedOrder(o)}>
                    <td className="py-3 font-mono text-xs">{o.id}</td>
                    <td className="py-3 text-xs">{new Date(o.date).toLocaleString()}</td>
                    <td className="py-3">{o.items.length}</td>
                    <td className="py-3 text-right font-medium">৳{o.total.toFixed(0)}</td>
                    <td className="py-3 text-xs">
                      {o.splitPayment ? (
                        <span className="space-y-0.5">
                          <span className="block">{getMethodLabel(o.splitPayment.method1)}: ৳{o.splitPayment.amount1.toFixed(0)}</span>
                          <span className="block">{getMethodLabel(o.splitPayment.method2)}: ৳{o.splitPayment.amount2.toFixed(0)}</span>
                        </span>
                      ) : (
                        getMethodLabel(o.paymentMethod || 'cash')
                      )}
                    </td>
                    <td className="py-3 text-right text-success">৳{(o.total - cost).toFixed(0)}</td>
                    <td className="py-3"><Badge variant="outline" className="text-xs capitalize">{o.status}</Badge></td>
                    <td className="py-3 text-center">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); }}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {orders.length === 0 && <p className="text-center py-10 opacity-40">{t('posHistory.noSales')}</p>}
        </div>
      </div>

      {selectedOrder && (
        <div className="w-full md:w-96 border-l flex flex-col overflow-auto" style={{ borderColor: 'hsl(var(--pos-border))', background: 'hsl(var(--pos-card))' }}>
          <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: 'hsl(var(--pos-border))' }}>
            <h3 className="text-sm font-semibold">{t('pos.invoicePreview')}</h3>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handlePrint} className="h-7 text-xs">
                <Printer className="h-3.5 w-3.5 mr-1" /> {t('posHistory.print')}
              </Button>
              <button onClick={() => setSelectedOrder(null)} className="opacity-60 hover:opacity-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div className="rounded-xl overflow-hidden shadow-lg">
              <POSInvoice ref={invoiceRef} order={selectedOrder} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
