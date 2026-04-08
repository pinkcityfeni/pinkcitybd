import { useStore } from '@/data/store';
import { Badge } from '@/components/ui/badge';

export default function POSSalesHistory() {
  const orders = useStore(s => s.orders.filter(o => o.type === 'pos'));
  const totalRev = orders.reduce((s, o) => s + o.total, 0);
  const totalCost = orders.reduce((s, o) => s + o.items.reduce((c, i) => c + i.product.buyingPrice * i.quantity, 0), 0);

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
