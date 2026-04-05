import { useState } from 'react';
import { useStore, Order } from '@/data/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MapPin, Phone, Mail, ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_COLORS: Record<Order['status'], string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  processing: 'bg-info/10 text-info border-info/20',
  completed: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function Orders() {
  const { orders, updateOrderStatus } = useStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const advance = (o: Order) => {
    const next: Record<string, Order['status']> = { pending: 'processing', processing: 'completed' };
    const ns = next[o.status];
    if (ns) { updateOrderStatus(o.id, ns); toast.success(`Order ${o.id} → ${ns}`); }
  };

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-xl font-bold">Orders</h1>
      <p className="text-sm text-muted-foreground mb-6">{orders.length} total orders</p>

      <div className="space-y-3">
        {orders.map(o => {
          const expanded = expandedId === o.id;
          return (
            <div key={o.id} className="rounded-xl border bg-card overflow-hidden">
              <button
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(expanded ? null : o.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs">{o.id}</span>
                    <Badge variant="outline" className="text-[10px]">{o.type.toUpperCase()}</Badge>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_COLORS[o.status]}`}>
                      {o.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm">
                    <span className="font-medium">{o.customerName || 'Guest'}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground text-xs">{new Date(o.date).toLocaleString()}</span>
                  </div>
                </div>
                <span className="font-bold text-primary">${o.total.toFixed(2)}</span>
                {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>

              {expanded && (
                <div className="border-t p-4 space-y-4 animate-fade-in">
                  {/* Customer details */}
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    {o.customerPhone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" /> {o.customerPhone}
                      </div>
                    )}
                    {o.customerEmail && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" /> {o.customerEmail}
                      </div>
                    )}
                    {o.deliveryAddress && (
                      <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                        <MapPin className="h-3.5 w-3.5 shrink-0" /> {o.deliveryAddress}
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Items</p>
                    {o.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm py-1">
                        <span>{item.product.name} × {item.quantity}</span>
                        <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      {o.pointsEarned ? `${o.pointsEarned} points earned` : ''}
                    </div>
                    <div className="flex gap-2">
                      {o.status !== 'completed' && o.status !== 'cancelled' && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => { updateOrderStatus(o.id, 'cancelled'); toast.success('Order cancelled'); }}>
                            Cancel
                          </Button>
                          <Button size="sm" onClick={() => advance(o)}>
                            {o.status === 'pending' ? 'Process' : 'Complete'}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
