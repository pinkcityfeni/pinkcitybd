import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/data/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Barcode, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function POSBarcode() {
  const products = useStore(s => s.products);
  const addToPosCart = useStore(s => s.addToPosCart);
  const [barcode, setBarcode] = useState('');
  const [result, setResult] = useState<typeof products[0] | null>(null);
  const [notFound, setNotFound] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    const code = barcode.trim();
    if (!code) return;
    const p = products.find(prod => prod.barcode === code);
    if (p) {
      setResult(p);
      setNotFound(false);
    } else {
      setResult(null);
      setNotFound(true);
    }
  };

  const handleAddToCart = () => {
    if (result) {
      addToPosCart(result);
      toast.success(`Added: ${result.name}`);
      setResult(null);
      setBarcode('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <h1 className="text-xl font-bold mb-1 flex items-center gap-2">
        <Barcode className="h-5 w-5 text-primary" /> Barcode Scanner
      </h1>
      <p className="text-sm opacity-60 mb-6">Scan or enter a barcode to look up products</p>

      <form onSubmit={handleScan} className="pos-panel flex gap-2 max-w-lg mb-6">
        <Input
          ref={inputRef}
          value={barcode}
          onChange={e => setBarcode(e.target.value)}
          placeholder="Enter barcode number..."
          className="bg-transparent border-pos-border text-lg font-mono"
          autoFocus
        />
        <Button type="submit" size="lg">Scan</Button>
      </form>

      {result && (
        <div className="pos-panel max-w-lg animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{result.name}</h3>
              <p className="text-sm opacity-60">{result.description}</p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="font-bold text-primary text-lg">${result.price.toFixed(2)}</span>
                <span className="opacity-50">Barcode: #{result.barcode}</span>
                <span className={result.stock < 20 ? 'text-warning' : 'text-success'}>{result.stock} in stock</span>
              </div>
            </div>
          </div>
          <Button className="w-full mt-4" onClick={handleAddToCart} disabled={result.stock === 0}>
            Add to POS Cart
          </Button>
        </div>
      )}

      {notFound && (
        <div className="pos-panel max-w-lg animate-fade-in text-center py-8">
          <p className="text-lg font-semibold mb-1">Product Not Found</p>
          <p className="text-sm opacity-50">No product matches barcode "<span className="font-mono">{barcode}</span>"</p>
        </div>
      )}

      {/* Quick reference */}
      <div className="mt-8 pos-panel max-w-lg">
        <h3 className="font-semibold text-sm mb-3">Barcode Reference</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {products.map(p => (
            <div key={p.id} className="flex justify-between py-1 opacity-60">
              <span className="truncate">{p.name}</span>
              <span className="font-mono shrink-0 ml-2">#{p.barcode}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
