import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import type { Order } from '@/data/store';
import { useProcessReturn } from '@/hooks/useSupabaseData';

interface Props {
  order: Order;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function ReturnDialog({ order, open, onOpenChange }: Props) {
  const processReturn = useProcessReturn();

  // build per-item state: max returnable = sold - alreadyReturned
  const itemsState = useMemo(() => {
    return order.items.map(it => {
      const alreadyReturned =
        order.returnedItems?.find(r => r.product_id === it.product.id)?.quantity || 0;
      const max = Math.max(0, it.quantity - alreadyReturned);
      return {
        productId: it.product.id,
        name: it.product.name,
        price: it.product.price,
        sold: it.quantity,
        alreadyReturned,
        max,
      };
    });
  }, [order]);

  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});
  const [method, setMethod] = useState('cash');
  const [reason, setReason] = useState('');

  const setQty = (id: string, q: number, max: number) => {
    const clamped = Math.max(0, Math.min(max, q));
    setQtyMap(m => ({ ...m, [id]: clamped }));
  };

  const refundTotal = useMemo(() => {
    return itemsState.reduce((s, it) => s + (qtyMap[it.productId] || 0) * it.price, 0);
  }, [itemsState, qtyMap]);

  const totalQty = Object.values(qtyMap).reduce((s, q) => s + q, 0);

  const handleSubmit = async () => {
    const items = itemsState
      .filter(it => (qtyMap[it.productId] || 0) > 0)
      .map(it => ({ product_id: it.productId, quantity: qtyMap[it.productId] }));
    if (items.length === 0) {
      toast.error('At least one item with quantity > 0');
      return;
    }
    try {
      const res = await processReturn.mutateAsync({
        order_id: order.id, items, refund_method: method, reason,
      });
      toast.success(`Return processed — Refund Tk ${res.total_refund.toFixed(0)}` +
        (res.points_reverted > 0 ? ` · −${res.points_reverted} pts` : ''));
      onOpenChange(false);
      setQtyMap({}); setReason('');
    } catch (e: any) {
      toast.error(e.message || 'Return failed');
    }
  };

  const allReturnedAlready = itemsState.every(it => it.max === 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" /> Return / Refund — #{order.id.slice(0, 8)}
          </DialogTitle>
        </DialogHeader>

        {allReturnedAlready ? (
          <p className="text-sm opacity-60 py-6 text-center">All items in this order have already been returned.</p>
        ) : (
          <>
            <div className="space-y-2 max-h-72 overflow-auto -mx-2 px-2">
              {itemsState.map(it => {
                const q = qtyMap[it.productId] || 0;
                const disabled = it.max === 0;
                return (
                  <div key={it.productId} className={`flex items-center gap-2 p-2 rounded-lg border ${disabled ? 'opacity-50' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{it.name}</p>
                      <p className="text-xs opacity-60">
                        Tk {it.price.toFixed(0)} × sold {it.sold}
                        {it.alreadyReturned > 0 && ` · returned ${it.alreadyReturned}`}
                        {' · max '}{it.max}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0"
                        disabled={disabled || q <= 0}
                        onClick={() => setQty(it.productId, q - 1, it.max)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number" min={0} max={it.max} value={q}
                        disabled={disabled}
                        onChange={(e) => setQty(it.productId, Number(e.target.value) || 0, it.max)}
                        className="h-7 w-14 text-center px-1"
                      />
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0"
                        disabled={disabled || q >= it.max}
                        onClick={() => setQty(it.productId, q + 1, it.max)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <Label className="text-xs">Refund Method</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Refund Total</Label>
                <div className="h-9 mt-1 px-3 rounded-md border bg-muted/40 flex items-center font-semibold">
                  Tk {refundTotal.toFixed(0)}
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs">Reason (optional)</Label>
              <Textarea
                value={reason} onChange={(e) => setReason(e.target.value)}
                placeholder="Damaged / wrong item / customer changed mind..."
                className="mt-1 min-h-16"
              />
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          {!allReturnedAlready && (
            <Button
              onClick={handleSubmit}
              disabled={totalQty === 0 || processReturn.isPending}>
              {processReturn.isPending ? 'Processing…' : `Process Return · Tk ${refundTotal.toFixed(0)}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}