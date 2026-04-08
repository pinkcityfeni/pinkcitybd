import { useStore } from '@/data/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Minus, Search } from 'lucide-react';

export default function Inventory() {
  const { products, categories, updateStock } = useStore();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  const filtered = products.filter(p => {
    if (filterCat && p.category !== filterCat) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const lowStock = products.filter(p => p.stock < 20).length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const totalValue = products.reduce((s, p) => s + p.buyingPrice * p.stock, 0);

  const adjust = (id: string, dir: 1 | -1) => {
    const amt = Number(amounts[id] || 1);
    if (amt <= 0) return;
    updateStock(id, amt * dir);
    toast.success(`Stock ${dir > 0 ? 'added' : 'removed'}`);
    setAmounts(a => ({ ...a, [id]: '' }));
  };

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="page-header">ইনভেন্টরি</h1>
      <p className="page-subheader mb-6">স্টক লেভেল ম্যানেজ করুন</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="stat-card"><p className="text-sm text-muted-foreground">মোট ইনভেন্টরি মূল্য</p><p className="text-2xl font-bold">৳{totalValue.toFixed(0)}</p></div>
        <div className="stat-card"><p className="text-sm text-muted-foreground">লো স্টক আইটেম</p><p className="text-2xl font-bold text-warning">{lowStock}</p></div>
        <div className="stat-card"><p className="text-sm text-muted-foreground">স্টক শেষ</p><p className="text-2xl font-bold text-destructive">{outOfStock}</p></div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="সার্চ করুন..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant={!filterCat ? 'default' : 'outline'} size="sm" onClick={() => setFilterCat('')}>All</Button>
          {categories.map(c => (
            <Button key={c.id} variant={filterCat === c.name ? 'default' : 'outline'} size="sm" onClick={() => setFilterCat(c.name)}>{c.icon} {c.name}</Button>
          ))}
        </div>
      </div>

      <div className="stat-card overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-3 font-medium">পণ্য</th>
              <th className="pb-3 font-medium">ক্যাটাগরি</th>
              <th className="pb-3 font-medium">বারকোড</th>
              <th className="pb-3 font-medium text-right">স্টক</th>
              <th className="pb-3 font-medium text-right">মূল্য</th>
              <th className="pb-3 font-medium text-right">অ্যাডজাস্ট</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-3 font-medium">{p.name}</td>
                <td className="py-3 text-xs">{p.category} · {p.subcategory}</td>
                <td className="py-3 font-mono text-xs">{p.barcode}</td>
                <td className={`py-3 text-right font-medium ${p.stock < 20 ? p.stock === 0 ? 'text-destructive' : 'text-warning' : ''}`}>{p.stock}</td>
                <td className="py-3 text-right">৳{(p.buyingPrice * p.stock).toFixed(0)}</td>
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
