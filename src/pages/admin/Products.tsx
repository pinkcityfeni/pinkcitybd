import { useState, useRef } from 'react';
import { useStore, Product } from '@/data/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Search, Camera, X as XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';


function ImageUpload({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative w-24 h-24 rounded-xl overflow-hidden border">
          <img src={value} alt="Product" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5 hover:bg-destructive hover:text-white transition-colors"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-colors text-sm text-muted-foreground w-full justify-center"
        >
          <Camera className="h-4 w-4" />
          <span>Upload Photo</span>
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
    </div>
  );
}


export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct, categories } = useStore();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = products.filter(p => {
    if (filterCat && p.category !== filterCat) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.barcode.includes(search)) return false;
    return true;
  });

  const selectedCat = categories.find(c => c.name === form.category);
  const subcategories = selectedCat?.subcategories || [];

  const openNew = () => {
    setEditProduct(null);
    setForm({ ...EMPTY_FORM, category: categories[0]?.name || '', subcategory: categories[0]?.subcategories[0] || '' });
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name, description: p.description, price: String(p.price),
      buyingPrice: String(p.buyingPrice), barcode: p.barcode, category: p.category,
      subcategory: p.subcategory, stock: String(p.stock), image: p.image,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.price || !form.category) {
      toast.error('Please fill required fields');
      return;
    }
    const data: Omit<Product, 'id'> = {
      name: form.name, description: form.description, price: Number(form.price),
      buyingPrice: Number(form.buyingPrice), barcode: form.barcode, category: form.category,
      subcategory: form.subcategory, stock: Number(form.stock), image: form.image,
    };
    if (editProduct) {
      updateProduct(editProduct.id, data);
      toast.success('Product updated');
    } else {
      addProduct(data);
      toast.success('Product added');
    }
    setDialogOpen(false);
  };

  const handleCategoryChange = (catName: string) => {
    const cat = categories.find(c => c.name === catName);
    setForm(f => ({ ...f, category: catName, subcategory: cat?.subcategories[0] || '' }));
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

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search by name or barcode..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant={!filterCat ? 'default' : 'outline'} size="sm" onClick={() => setFilterCat('')}>All</Button>
          {categories.map(c => (
            <Button key={c.id} variant={filterCat === c.name ? 'default' : 'outline'} size="sm" onClick={() => setFilterCat(c.name)}>
              {c.icon} {c.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Mobile: Card layout */}
      <div className="sm:hidden space-y-3">
        {filtered.map(p => (
          <div key={p.id} className="stat-card p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-sm">{p.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{p.category} · {p.subcategory}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(p)} className="p-1.5 hover:text-primary rounded-lg hover:bg-primary/10"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => { deleteProduct(p.id); toast.success('Deleted'); }} className="p-1.5 hover:text-destructive rounded-lg hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className="text-[10px]">{p.barcode}</Badge>
              <span className={`font-medium ${p.stock < 20 ? 'text-destructive' : 'text-muted-foreground'}`}>Stock: {p.stock}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-primary">${p.price.toFixed(2)}</span>
              <span className="text-xs text-muted-foreground">Buy: ${p.buyingPrice.toFixed(2)}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">No products found</div>
        )}
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden sm:block stat-card overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-3 font-medium">Product</th>
              <th className="pb-3 font-medium">Barcode</th>
              <th className="pb-3 font-medium">Category</th>
              <th className="pb-3 font-medium">Subcategory</th>
              <th className="pb-3 font-medium text-right">Price</th>
              <th className="pb-3 font-medium text-right">Buy Price</th>
              <th className="pb-3 font-medium text-right">Stock</th>
              <th className="pb-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-3 font-medium">{p.name}</td>
                <td className="py-3 font-mono text-xs">{p.barcode}</td>
                <td className="py-3"><Badge variant="outline" className="text-xs">{p.category}</Badge></td>
                <td className="py-3 text-xs text-muted-foreground">{p.subcategory}</td>
                <td className="py-3 text-right">${p.price.toFixed(2)}</td>
                <td className="py-3 text-right text-muted-foreground">${p.buyingPrice.toFixed(2)}</td>
                <td className={`py-3 text-right font-medium ${p.stock < 20 ? 'text-destructive' : ''}`}>{p.stock}</td>
                <td className="py-3 text-right">
                  <button onClick={() => openEdit(p)} className="p-1 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => { deleteProduct(p.id); toast.success('Deleted'); }} className="p-1 hover:text-destructive ml-1"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editProduct ? 'Edit Product' : 'New Product'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 max-h-[70vh] overflow-auto pr-1">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <Label>Product Image</Label>
              <ImageUpload
                value={form.image}
                onChange={(val) => setForm(f => ({ ...f, image: val }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Selling Price *</Label>
                <Input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
              </div>
              <div>
                <Label>Buying Price</Label>
                <Input type="number" step="0.01" value={form.buyingPrice} onChange={e => setForm(f => ({ ...f, buyingPrice: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Barcode</Label>
                <Input value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} />
              </div>
              <div>
                <Label>Stock</Label>
                <Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category *</Label>
                <select
                  className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                  value={form.category}
                  onChange={e => handleCategoryChange(e.target.value)}
                >
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <Label>Subcategory</Label>
                <select
                  className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                  value={form.subcategory}
                  onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}
                >
                  <option value="">Select subcategory</option>
                  {subcategories.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                </select>
              </div>
            </div>
            <Button onClick={handleSave} className="mt-2">{editProduct ? 'Update' : 'Add'} Product</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
