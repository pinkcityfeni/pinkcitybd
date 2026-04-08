import { useState, useRef } from 'react';
import { useStore } from '@/data/store';
import type { PaymentMethod, Order } from '@/data/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';
import { Printer, Eye, X } from 'lucide-react';
import { toast } from 'sonner';
import POSInvoice from '@/components/pos/POSInvoice';

const getMethodLabel = (m: PaymentMethod): string => {
  const map: Record<PaymentMethod, string> = { cash: 'নগদ', cod: 'নগদ', bkash: 'বিকাশ', nagad: 'নগদ (Nagad)', bank: 'ব্যাংক', card: 'কার্ড' };
  return map[m] || m;
};

export default function POSSalesHistory() {
  const allOrders = useStore(s => s.orders);
  const orders = useMemo(() => allOrders.filter(o => o.type === 'pos'), [allOrders]);
  const totalRev = useMemo(() => orders.reduce((s, o) => s + o.total, 0), [orders]);
  const totalCost = useMemo(() => orders.reduce((s, o) => s + o.items.reduce((c, i) => c + i.product.buyingPrice * i.quantity, 0), 0), [orders]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!invoiceRef.current || !selectedOrder) return;
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) { toast.error('Popup blocked!'); return; }
    printWindow.document.write(`
      <html><head><title>Invoice - ${selectedOrder.id}</title>
      <style>body{margin:0;font-family:monospace;}</style></head>
      <body>${invoiceRef.current.innerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className={`flex-1 p-6 overflow-auto ${selectedOrder ? 'hidden md:block' : ''}`}>
        <h1 className="text-xl font-bold mb-1">POS বিক্রি ইতিহাস</h1>
        <p className="text-sm opacity-60 mb-6">{orders.length}টি লেনদেন</p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="pos-panel">
            <p className="text-xs opacity-50">মোট রেভিনিউ</p>
            <p className="text-xl font-bold text-primary">৳{totalRev.toFixed(0)}</p>
          </div>
          <div className="pos-panel">
            <p className="text-xs opacity-50">মোট লাভ</p>
            <p className="text-xl font-bold text-success">৳{(totalRev - totalCost).toFixed(0)}</p>
          </div>
          <div className="pos-panel">
            <p className="text-xs opacity-50">লেনদেন</p>
            <p className="text-xl font-bold">{orders.length}</p>
          </div>
        </div>

        <div className="pos-panel overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left opacity-60" style={{ borderColor: 'hsl(var(--pos-border))' }}>
                <th className="pb-3 font-medium">Order ID</th>
                <th className="pb-3 font-medium">তারিখ</th>
                <th className="pb-3 font-medium">আইটেম</th>
                <th className="pb-3 font-medium text-right">মোট</th>
                <th className="pb-3 font-medium">পেমেন্ট</th>
                <th className="pb-3 font-medium text-right">লাভ</th>
                <th className="pb-3 font-medium">স্ট্যাটাস</th>
                <th className="pb-3 font-medium text-center">ইনভয়েস</th>
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
          {orders.length === 0 && <p className="text-center py-10 opacity-40">কোনো POS বিক্রি নেই</p>}
        </div>
      </div>

      {/* Invoice Preview Panel */}
      {selectedOrder && (
        <div className="w-full md:w-96 border-l flex flex-col overflow-auto" style={{ borderColor: 'hsl(var(--pos-border))', background: 'hsl(var(--pos-card))' }}>
          <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: 'hsl(var(--pos-border))' }}>
            <h3 className="text-sm font-semibold">ইনভয়েস প্রিভিউ</h3>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handlePrint} className="h-7 text-xs">
                <Printer className="h-3.5 w-3.5 mr-1" /> প্রিন্ট
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
