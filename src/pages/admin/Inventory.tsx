import { useStore } from '@/data/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Minus, Search } from 'lucide-react';

export default function Inventory() {
  const { products, updateStock } = useStore();
  const [search, setSearch] = useState('');
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const lowStock = products.filter(p => p.stock < 20).length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const totalValue = products.reduce((s, p) => s + p.cost * p.stock, 0);

  const adjust = (id: string, dir: 1 | -1) => {
    const amt = Number(amounts[id] || 1);
    if (amt <= 0) return;
    updateStock(id, amt * dir);
    toast.success(`Stock ${dir > 0 ? 'added' : 'removed'}`);
    setAmounts(a => ({ ...a, [id]: '' }));
  };

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="page-header">Inventory</h1>
      <p className="page-subheader mb-6">Manage stock levels</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="stat-card"><p className="text-sm text-muted-foreground">Total Inventory Value</p><p className="text-2xl font-bold">${totalValue.toFixed(2)}</p></div>
        <div className="stat-card"><p className="text-sm text-muted-foreground">Low Stock Items</p><p className="text-2xl font-bold text-warning">{lowStock}</p></div>
        <div className="stat-card"><p className="text-sm text-muted-foreground">Out of Stock</p><p className="text-2xl font-bold text-destructive">{outOfStock}</p></div>
      </div>

      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input className="pl-8" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="stat-card overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-3 font-medium">Product</th>
              <th className="pb-3 font-medium">Barcode</th>
              <th className="pb-3 font-medium text-right">Stock</th>
              <th className="pb-3 font-medium text-right">Value</th>
              <th className="pb-3 font-medium text-right">Adjust</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-3 font-medium">{p.name}</td>
                <td className="py-3 font-mono text-xs">{p.barcode}</td>
                <td className={`py-3 text-right font-medium ${p.stock < 20 ? p.stock === 0 ? 'text-destructive' : 'text-warning' : ''}`}>{p.stock} {p.unit}</td>
                <td className="py-3 text-right">${(p.cost * p.stock).toFixed(2)}</td>
                <td className="py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => adjust(p.id, -1)}><Minus className="h-3 w-3" /></Button>
                    <Input className="w-16 h-7 text-center text-xs" type="number" placeholder="1" value={amounts[p.id] || ''} onChange={e => setAmounts(a => ({ ...a, [p.id]: e.target.value }))} />
                    <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => adjust(p.id, 1)}><Plus className="h-3 w-3" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
