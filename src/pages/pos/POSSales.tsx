import { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '@/data/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Search, CheckCircle2, ScanBarcode, Minus, Plus, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export default function POSSales() {
  const { products, posCart, addToPosCart, removeFromPosCart, updatePosCartQty, placeOrder } = useStore();
  const [barcode, setBarcode] = useState('');
  const [search, setSearch] = useState('');
  const [saleComplete, setSaleComplete] = useState<{ id: string; total: number; profit: number; itemCount: number } | null>(null);
  const barcodeRef = useRef<HTMLInputElement>(null);

  // Always keep barcode input focused for scanner
  const focusBarcode = useCallback(() => {
    setTimeout(() => barcodeRef.current?.focus(), 50);
  }, []);

  useEffect(() => { focusBarcode(); }, [focusBarcode]);

  const total = posCart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const totalCost = posCart.reduce((sum, i) => sum + i.product.buyingPrice * i.quantity, 0);
  const profit = total - totalCost;
  const itemCount = posCart.reduce((sum, i) => sum + i.quantity, 0);

  // Barcode scanner sends keystrokes ending with Enter
  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    const code = barcode.trim();
    if (!code) return;

    const p = products.find(prod => prod.barcode === code);
    if (p) {
      if (p.stock <= 0) {
        toast.error(`Out of stock: ${p.name}`);
      } else {
        const inCart = posCart.find(i => i.product.id === p.id);
        if (inCart && inCart.quantity >= p.stock) {
          toast.error(`Max stock reached: ${p.name}`);
        } else {
          addToPosCart(p);
          toast.success(`✓ ${p.name}`, { duration: 1500 });
        }
      }
    } else {
      toast.error(`No product found for barcode: ${code}`);
    }
    setBarcode('');
    focusBarcode();
  };

  const handleCompleteSale = () => {
    if (posCart.length === 0) return;
    const saleTotal = total;
    const saleProfit = profit;
    const saleItems = itemCount;
    const id = placeOrder('pos');
    setSaleComplete({ id, total: saleTotal, profit: saleProfit, itemCount: saleItems });
  };

  const handleNewSale = () => {
    setSaleComplete(null);
    focusBarcode();
  };

  const filteredProducts = search
    ? products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode.includes(search) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      )
    : products.slice(0, 12);

  if (saleComplete) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <CheckCircle2 className="h-20 w-20 mx-auto mb-4 text-success" />
        <h2 className="text-2xl font-bold mb-2">Sale Complete!</h2>
        <p className="text-sm opacity-70 mb-1">Order: {saleComplete.id}</p>
        <p className="text-sm opacity-70 mb-1">{saleComplete.itemCount} items sold</p>
        <p className="text-3xl font-bold text-primary my-3">${saleComplete.total.toFixed(2)}</p>
        <p className="text-sm text-success font-medium mb-6">Profit: ${saleComplete.profit.toFixed(2)}</p>
        <Button size="lg" onClick={handleNewSale}>New Sale</Button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left: Products panel */}
      <div className="flex-1 p-4 space-y-3 overflow-auto">
        {/* Barcode scanner input — always ready */}
        <form onSubmit={handleBarcodeScan}>
          <div className="pos-panel flex gap-2 items-center">
            <ScanBarcode className="h-5 w-5 text-primary shrink-0" />
            <Input
              ref={barcodeRef}
              value={barcode}
              onChange={e => setBarcode(e.target.value)}
              placeholder="Scan barcode or type code + Enter..."
              className="bg-transparent border-pos-border font-mono text-lg"
              autoFocus
            />
            <Button type="submit" size="sm">Add</Button>
          </div>
        </form>

        {/* Product quick-select grid */}
        <div className="pos-panel">
          <div className="flex items-center gap-2 mb-3">
            <Search className="h-4 w-4 opacity-50" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, barcode, or category..."
              className="bg-transparent border-pos-border"
              onFocus={() => {}} // Don't steal from barcode on click
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {filteredProducts.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  if (p.stock <= 0) { toast.error('Out of stock'); return; }
                  addToPosCart(p);
                  toast.success(`✓ ${p.name}`, { duration: 1500 });
                  focusBarcode();
                }}
                className="p-3 rounded-lg text-left transition-all hover:bg-primary/10 hover:scale-[1.02] disabled:opacity-40"
                style={{ background: 'hsl(var(--pos-bg))' }}
                disabled={p.stock === 0}
              >
                <p className="text-xs truncate font-medium">{p.name}</p>
                <p className="text-sm font-bold text-primary mt-1">${p.price.toFixed(2)}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] font-mono opacity-50">#{p.barcode}</span>
                  <span className={`text-[10px] font-medium ${p.stock < 10 ? 'text-destructive' : 'text-success'}`}>
                    {p.stock} left
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Cart panel */}
      <div className="w-80 lg:w-96 border-l flex flex-col" style={{ borderColor: 'hsl(var(--pos-border))', background: 'hsl(var(--pos-card))' }}>
        <div className="p-4 border-b font-semibold text-sm flex items-center gap-2" style={{ borderColor: 'hsl(var(--pos-border))' }}>
          <ShoppingCart className="h-4 w-4 text-primary" />
          Cart ({itemCount} items)
        </div>

        <div className="flex-1 overflow-auto p-3 space-y-1">
          {posCart.map(item => (
            <div key={item.product.id} className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: 'hsl(var(--pos-bg))' }}>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{item.product.name}</p>
                <p className="text-[10px] opacity-50">#{item.product.barcode} · ${item.product.price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  className="h-6 w-6 rounded flex items-center justify-center hover:bg-primary/20 transition-colors"
                  onClick={() => {
                    if (item.quantity <= 1) removeFromPosCart(item.product.id);
                    else updatePosCartQty(item.product.id, item.quantity - 1);
                  }}
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button
                  className="h-6 w-6 rounded flex items-center justify-center hover:bg-primary/20 transition-colors"
                  onClick={() => {
                    if (item.quantity >= item.product.stock) { toast.error('Max stock'); return; }
                    updatePosCartQty(item.product.id, item.quantity + 1);
                  }}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <span className="text-xs font-bold w-16 text-right">${(item.product.price * item.quantity).toFixed(2)}</span>
              <button onClick={() => removeFromPosCart(item.product.id)} className="text-destructive/70 hover:text-destructive ml-1">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {posCart.length === 0 && (
            <div className="text-center py-16 opacity-40">
              <ScanBarcode className="h-10 w-10 mx-auto mb-2" />
              <p className="text-sm">Scan a barcode to start</p>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="p-4 border-t space-y-2" style={{ borderColor: 'hsl(var(--pos-border))' }}>
          <div className="flex justify-between text-xs opacity-70">
            <span>Subtotal ({itemCount} items)</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs opacity-70">
            <span>Cost</span>
            <span>${totalCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs font-medium text-success">
            <span>Profit</span>
            <span>${profit.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2" style={{ borderColor: 'hsl(var(--pos-border))' }}>
            <span>Total</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>
          <Button className="w-full" size="lg" disabled={posCart.length === 0} onClick={handleCompleteSale}>
            Complete Sale — ${total.toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
}
