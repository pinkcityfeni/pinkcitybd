import { useState } from 'react';
import { useStore, Product } from '@/data/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct, categories } = useStore();
  const [search, setSearch] = useState('');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search));

  const [form, setForm] = useState({ name: '', description: '', price: '', cost: '', barcode: '', category: '', stock: '', unit: 'pcs' });

  const openNew = () => {
    setEditProduct(null);
    setForm({ name: '', description: '', price: '', cost: '', barcode: '', category: categories[0], stock: '', unit: 'pcs' });
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({ name: p.name, description: p.description, price: String(p.price), cost: String(p.cost), barcode: p.barcode, category: p.category, stock: String(p.stock), unit: p.unit });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const data = { name: form.name, description: form.description, price: Number(form.price), cost: Number(form.cost), barcode: form.barcode, category: form.category, stock: Number(form.stock), unit: form.unit, image: '' };
    if (editProduct) {
      updateProduct(editProduct.id, data);
      toast.success('Product updated');
    } else {
      addProduct(data);
      toast.success('Product added');
    }
    setDialogOpen(false);
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header">Products</h1>
          <p className="page-subheader">{products.length} total products</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Add Product</Button>
      </div>

      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input className="pl-8" placeholder="Search by name or barcode..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="stat-card overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-3 font-medium">Product</th>
              <th className="pb-3 font-medium">Barcode</th>
              <th className="pb-3 font-medium">Category</th>
              <th className="pb-3 font-medium text-right">Price</th>
              <th className="pb-3 font-medium text-right">Cost</th>
              <th className="pb-3 font-medium text-right">Stock</th>
              <th className="pb-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-3 font-medium">{p.name}</td>
                <td className="py-3 font-mono text-xs">{p.barcode}</td>
                <td className="py-3">{p.category}</td>
                <td className="py-3 text-right">${p.price.toFixed(2)}</td>
                <td className="py-3 text-right text-muted-foreground">${p.cost.toFixed(2)}</td>
                <td className={`py-3 text-right font-medium ${p.stock < 20 ? 'text-destructive' : ''}`}>{p.stock}</td>
                <td className="py-3 text-right">
                  <button onClick={() => openEdit(p)} className="p-1 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => { deleteProduct(p.id); toast.success('Deleted'); }} className="p-1 hover:text-destructive ml-1"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editProduct ? 'Edit Product' : 'New Product'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Price</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
              <div><Label>Cost</Label><Input type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Barcode</Label><Input value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} /></div>
              <div><Label>Category</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} /></div>
              <div><Label>Unit</Label><Input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} /></div>
            </div>
            <Button onClick={handleSave} className="mt-2">{editProduct ? 'Update' : 'Add'} Product</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
