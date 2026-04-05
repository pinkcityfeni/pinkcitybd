import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/data/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Search, CheckCircle2, Store, LayoutDashboard, ScanBarcode } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function POS() {
  const { products, posCart, addToPosCart, removeFromPosCart, updatePosCartQty, placeOrder } = useStore();
  const [barcode, setBarcode] = useState('');
  const [search, setSearch] = useState('');
  const [saleComplete, setSaleComplete] = useState<{ id: string; total: number } | null>(null);
  const barcodeRef = useRef<HTMLInputElement>(null);

  useEffect(() => { barcodeRef.current?.focus(); }, []);

  const total = posCart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const totalCost = posCart.reduce((sum, i) => sum + i.product.cost * i.quantity, 0);
  const profit = total - totalCost;

  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    const p = products.find(prod => prod.barcode === barcode.trim());
    if (p) {
      addToPosCart(p);
      toast.success(`Added: ${p.name}`);
    } else {
      toast.error('Product not found');
    }
    setBarcode('');
  };

  const handleCompleteSale = () => {
    if (posCart.length === 0) return;
    const id = placeOrder('pos');
    setSaleComplete(id);
  };

  const filteredProducts = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search))
    : products.slice(0, 8);

  if (saleComplete) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(var(--pos-bg))' }}>
      <div className="text-center animate-fade-in" style={{ color: 'hsl(var(--pos-foreground))' }}>
        <CheckCircle2 className="h-20 w-20 mx-auto mb-4 text-success" />
        <h2 className="text-2xl font-bold mb-2">Sale Complete!</h2>
        <p className="text-sm opacity-70 mb-1">Order: {saleComplete}</p>
        <p className="text-xl font-bold text-success mb-6">${total.toFixed(2)}</p>
        <Button size="lg" onClick={() => setSaleComplete(null)}>New Sale</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'hsl(var(--pos-bg))', color: 'hsl(var(--pos-foreground))' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 border-b" style={{ borderColor: 'hsl(var(--pos-border))' }}>
        <div className="flex items-center gap-2 font-bold">
          <ScanBarcode className="h-5 w-5 text-primary" />
          POS Terminal
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link to="/"><Store className="h-4 w-4 mr-1" /> Shop</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link to="/admin"><LayoutDashboard className="h-4 w-4 mr-1" /> Admin</Link>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Products panel */}
        <div className="flex-1 p-4 space-y-4 overflow-auto">
          {/* Barcode input */}
          <form onSubmit={handleBarcodeScan}>
            <div className="pos-panel flex gap-2">
              <Input
                ref={barcodeRef}
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
                placeholder="Scan barcode or enter code..."
                className="bg-transparent border-pos-border"
              />
              <Button type="submit">Scan</Button>
            </div>
          </form>

          {/* Quick product grid */}
          <div className="pos-panel">
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-4 w-4 opacity-50" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="bg-transparent border-pos-border" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {filteredProducts.map(p => (
                <button
                  key={p.id}
                  onClick={() => { addToPosCart(p); toast.success(`Added: ${p.name}`); }}
                  className="p-3 rounded-lg text-left transition-colors hover:bg-primary/10"
                  style={{ background: 'hsl(var(--pos-bg))' }}
                  disabled={p.stock === 0}
                >
                  <p className="text-xs truncate font-medium">{p.name}</p>
                  <p className="text-sm font-bold text-primary mt-1">${p.price.toFixed(2)}</p>
                  <p className="text-[10px] opacity-50">#{p.barcode} · {p.stock} left</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cart panel */}
        <div className="w-80 lg:w-96 border-l flex flex-col" style={{ borderColor: 'hsl(var(--pos-border))', background: 'hsl(var(--pos-card))' }}>
          <div className="p-4 border-b font-semibold text-sm" style={{ borderColor: 'hsl(var(--pos-border))' }}>
            Cart ({posCart.length} items)
          </div>
          <div className="flex-1 overflow-auto p-3 space-y-2">
            {posCart.map(item => (
              <div key={item.product.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'hsl(var(--pos-bg))' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{item.product.name}</p>
                  <p className="text-xs text-primary">${item.product.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <button className="px-1.5 py-0.5 rounded hover:bg-primary/20" onClick={() => updatePosCartQty(item.product.id, item.quantity - 1)}>−</button>
                  <span className="w-6 text-center">{item.quantity}</span>
                  <button className="px-1.5 py-0.5 rounded hover:bg-primary/20" onClick={() => updatePosCartQty(item.product.id, item.quantity + 1)}>+</button>
                </div>
                <span className="text-xs font-bold w-14 text-right">${(item.product.price * item.quantity).toFixed(2)}</span>
                <button onClick={() => removeFromPosCart(item.product.id)} className="text-destructive/70 hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {posCart.length === 0 && <p className="text-center text-sm opacity-40 py-10">Scan or select products</p>}
          </div>
          <div className="p-4 border-t space-y-2" style={{ borderColor: 'hsl(var(--pos-border))' }}>
            <div className="flex justify-between text-xs opacity-70"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
            <div className="flex justify-between text-xs opacity-70"><span>Profit</span><span className="text-success">${profit.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-lg border-t pt-2" style={{ borderColor: 'hsl(var(--pos-border))' }}>
              <span>Total</span><span className="text-primary">${total.toFixed(2)}</span>
            </div>
            <Button className="w-full" size="lg" disabled={posCart.length === 0} onClick={handleCompleteSale}>
              Complete Sale
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
