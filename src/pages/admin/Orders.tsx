import { useStore, Order } from '@/data/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const STATUS_COLORS: Record<Order['status'], string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  processing: 'bg-info/10 text-info border-info/20',
  completed: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function Orders() {
  const { orders, updateOrderStatus } = useStore();

  const advance = (o: Order) => {
    const next: Record<string, Order['status']> = { pending: 'processing', processing: 'completed' };
    const ns = next[o.status];
    if (ns) { updateOrderStatus(o.id, ns); toast.success(`Order ${o.id} → ${ns}`); }
  };

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="page-header">Orders</h1>
      <p className="page-subheader mb-6">{orders.length} total orders</p>

      <div className="stat-card overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-3 font-medium">Order ID</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Customer</th>
              <th className="pb-3 font-medium">Type</th>
              <th className="pb-3 font-medium">Items</th>
              <th className="pb-3 font-medium text-right">Total</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-3 font-mono text-xs">{o.id}</td>
                <td className="py-3 text-xs">{new Date(o.date).toLocaleDateString()}</td>
                <td className="py-3">{o.customerName || '—'}</td>
                <td className="py-3"><Badge variant="outline" className="text-xs">{o.type.toUpperCase()}</Badge></td>
                <td className="py-3">{o.items.length}</td>
                <td className="py-3 text-right font-medium">${o.total.toFixed(2)}</td>
                <td className="py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[o.status]}`}>
                    {o.status}
                  </span>
                </td>
                <td className="py-3 text-right">
                  {o.status !== 'completed' && o.status !== 'cancelled' && (
                    <Button size="sm" variant="outline" onClick={() => advance(o)}>
                      {o.status === 'pending' ? 'Process' : 'Complete'}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
