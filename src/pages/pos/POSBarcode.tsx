import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/data/store';
import { useProducts } from '@/hooks/useSupabaseData';
import { useLanguage } from '@/data/language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Barcode, Package } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/data/store';

export default function POSBarcode() {
  const { data: products = [] } = useProducts();
  const addToPosCart = useStore(s => s.addToPosCart);
  const { t } = useLanguage();
  const [barcode, setBarcode] = useState('');
  const [result, setResult] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    const code = barcode.trim();
    if (!code) return;
    const p = products.find(prod => prod.barcode === code);
    if (p) { setResult(p); setNotFound(false); }
    else { setResult(null); setNotFound(true); }
  };

  const handleAddToCart = () => {
    if (result) {
      addToPosCart(result);
      toast.success(t('posBarcode.added', { name: result.name }));
      setResult(null);
      setBarcode('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <h1 className="text-xl font-bold mb-1 flex items-center gap-2">
        <Barcode className="h-5 w-5 text-primary" /> {t('posBarcode.title')}
      </h1>
      <p className="text-sm opacity-60 mb-6">{t('posBarcode.desc')}</p>

      <form onSubmit={handleScan} className="pos-panel flex gap-2 max-w-lg mb-6">
        <Input ref={inputRef} value={barcode} onChange={e => setBarcode(e.target.value)} placeholder={t('posBarcode.placeholder')} className="bg-transparent border-pos-border text-lg font-mono" autoFocus />
        <Button type="submit" size="lg">{t('posBarcode.scan')}</Button>
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
                <span className="font-bold text-primary text-lg">৳{result.price.toFixed(0)}</span>
                <span className="opacity-50">{t('product.barcode')}: #{result.barcode}</span>
                <span className={result.stock < 20 ? 'text-warning' : 'text-success'}>{t('posBarcode.inStock', { n: result.stock })}</span>
              </div>
            </div>
          </div>
          <Button className="w-full mt-4" onClick={handleAddToCart} disabled={result.stock === 0}>
            {t('posBarcode.addToCart')}
          </Button>
        </div>
      )}

      {notFound && (
        <div className="pos-panel max-w-lg animate-fade-in text-center py-8">
          <p className="text-lg font-semibold mb-1">{t('posBarcode.notFound')}</p>
          <p className="text-sm opacity-50">{t('posBarcode.noMatch')} "<span className="font-mono">{barcode}</span>"</p>
        </div>
      )}

      <div className="mt-8 pos-panel max-w-lg">
        <h3 className="font-semibold text-sm mb-3">{t('posBarcode.reference')}</h3>
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
