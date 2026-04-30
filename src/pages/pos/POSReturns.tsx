import { useMemo } from 'react';
import { useReturns, useOrders } from '@/hooks/useSupabaseData';
import { Badge } from '@/components/ui/badge';
import { RotateCcw } from 'lucide-react';

export default function POSReturns() {
  const { data: returns = [], isLoading } = useReturns();
  const { data: orders = [] } = useOrders();

  const totalRefund = useMemo(() => returns.reduce((s, r) => s + Number(r.total_refund), 0), [returns]);
  const totalPoints = useMemo(() => returns.reduce((s, r) => s + Number(r.points_reverted || 0), 0), [returns]);

  return (
    <div className="flex-1 p-6 overflow-auto">
      <h1 className="text-xl font-bold mb-1 flex items-center gap-2">
        <RotateCcw className="h-5 w-5" /> Returns
      </h1>
      <p className="text-sm opacity-60 mb-6">{returns.length} returns processed</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="pos-panel">
          <p className="text-xs opacity-50">Total Refunds</p>
          <p className="text-xl font-bold text-destructive">৳{totalRefund.toFixed(0)}</p>
        </div>
        <div className="pos-panel">
          <p className="text-xs opacity-50">Returns</p>
          <p className="text-xl font-bold">{returns.length}</p>
        </div>
        <div className="pos-panel">
          <p className="text-xs opacity-50">Points Reverted</p>
          <p className="text-xl font-bold">{totalPoints}</p>
        </div>
      </div>

      <div className="pos-panel overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left opacity-60" style={{ borderColor: 'hsl(var(--pos-border))' }}>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Order</th>
              <th className="pb-3 font-medium">Customer</th>
              <th className="pb-3 font-medium">Items</th>
              <th className="pb-3 font-medium text-right">Refund</th>
              <th className="pb-3 font-medium">Method</th>
              <th className="pb-3 font-medium">Reason</th>
            </tr>
          </thead>
          <tbody>
            {returns.map(r => {
              const order = orders.find(o => o.id === r.order_id);
              return (
                <tr key={r.id} className="border-b last:border-0" style={{ borderColor: 'hsl(var(--pos-border))' }}>
                  <td className="py-3 text-xs">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="py-3 font-mono text-xs">{r.order_id.slice(0, 8)}</td>
                  <td className="py-3 text-xs">{order?.customerName || order?.customerPhone || '—'}</td>
                  <td className="py-3 text-xs">
                    {r.items.map((it, i) => (
                      <div key={i}>{it.name} × {it.quantity}</div>
                    ))}
                  </td>
                  <td className="py-3 text-right font-medium text-destructive">৳{Number(r.total_refund).toFixed(0)}</td>
                  <td className="py-3 text-xs">
                    <Badge variant="outline" className="capitalize">{r.refund_method}</Badge>
                  </td>
                  <td className="py-3 text-xs opacity-70 max-w-[200px] truncate">{r.reason || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!isLoading && returns.length === 0 && (
          <p className="text-center py-10 opacity-40">No returns yet</p>
        )}
      </div>
    </div>
  );
}