import { useStore } from '@/data/store';
import type { PaymentMethod } from '@/data/store';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';

const getMethodLabel = (m: PaymentMethod): string => {
  const map: Record<PaymentMethod, string> = { cash: 'নগদ', cod: 'নগদ', bkash: 'বিকাশ', nagad: 'নগদ (Nagad)', bank: 'ব্যাংক', card: 'কার্ড' };
  return map[m] || m;
};

export default function POSSalesHistory() {
  const allOrders = useStore(s => s.orders);
  const orders = useMemo(() => allOrders.filter(o => o.type === 'pos'), [allOrders]);
  const totalRev = useMemo(() => orders.reduce((s, o) => s + o.total, 0), [orders]);
  const totalCost = useMemo(() => orders.reduce((s, o) => s + o.items.reduce((c, i) => c + i.product.buyingPrice * i.quantity, 0), 0), [orders]);

  return (
    <div className="flex-1 p-6 overflow-auto">
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
            </tr>
          </thead>
          <tbody>
            {orders.map(o => {
              const cost = o.items.reduce((s, i) => s + i.product.buyingPrice * i.quantity, 0);
              return (
                <tr key={o.id} className="border-b last:border-0" style={{ borderColor: 'hsl(var(--pos-border))' }}>
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
                </tr>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && <p className="text-center py-10 opacity-40">কোনো POS বিক্রি নেই</p>}
      </div>
    </div>
  );
}
