import { useState, useRef } from 'react';
import { Product } from '@/data/store';
import { useProducts, useCategories, useAddProduct, useUpdateProduct, useDeleteProduct, uploadImage } from '@/hooks/useSupabaseData';
import { useLanguage } from '@/data/language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Search, Camera, X as XIcon, Flame } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const EMPTY_FORM = { name: '', description: '', price: '', buyingPrice: '', barcode: '', category: '', subcategory: '', stock: '', image: '', images: [] as string[] };

function MultiImageUpload({ images, onChange, uploadLabel }: { images: string[]; onChange: (imgs: string[]) => void; uploadLabel: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); continue; }
      try {
        const url = await uploadImage(file);
        onChange([...images, url]);
      } catch { toast.error('Upload failed'); }
    }
    e.target.value = '';
  };
  const removeImage = (index: number) => onChange(images.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {images.map((img, i) => (
          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border">
            <img src={img} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
            <button type="button" onClick={() => removeImage(i)} className="absolute top-0.5 right-0.5 bg-background/80 rounded-full p-0.5 hover:bg-destructive hover:text-white transition-colors">
              <XIcon className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => fileRef.current?.click()} className="flex flex-col items-center justify-center w-20 h-20 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-colors text-muted-foreground">
          <Camera className="h-4 w-4" />
          <span className="text-[10px] mt-1">{uploadLabel}</span>
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
    </div>
  );
}

export default function Products() {
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const addProductMut = useAddProduct();
  const updateProductMut = useUpdateProduct();
  const deleteProductMut = useDeleteProduct();
  const { t } = useLanguage();
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
    setForm({ name: p.name, description: p.description, price: String(p.price), buyingPrice: String(p.buyingPrice), barcode: p.barcode, category: p.category, subcategory: p.subcategory, stock: String(p.stock), image: p.image, images: p.images || [] });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.price || !form.category) { toast.error(t('prod.fillRequired')); return; }
    const allImages = form.images;
    const mainImage = allImages[0] || form.image || '';
    const data: Omit<Product, 'id'> = { name: form.name, description: form.description, price: Number(form.price), buyingPrice: Number(form.buyingPrice), barcode: form.barcode, category: form.category, subcategory: form.subcategory, stock: Number(form.stock), image: mainImage, images: allImages, source: editProduct?.source || 'manual' };
    if (editProduct) { updateProductMut.mutate({ id: editProduct.id, updates: data }); toast.success(t('prod.updated')); }
    else { addProductMut.mutate(data); toast.success(t('prod.added')); }
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
          <h1 className="page-header">{t('prod.title')}</h1>
          <p className="page-subheader">{t('prod.totalProducts', { n: products.length })}</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> {t('prod.addProduct')}</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder={t('prod.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant={!filterCat ? 'default' : 'outline'} size="sm" onClick={() => setFilterCat('')}>{t('general.all')}</Button>
          {categories.map(c => (
            <Button key={c.id} variant={filterCat === c.name ? 'default' : 'outline'} size="sm" onClick={() => setFilterCat(c.name)}>{c.icon} {c.name}</Button>
          ))}
        </div>
      </div>

      {/* Mobile */}
      <div className="sm:hidden space-y-3">
        {filtered.map(p => (
          <div key={p.id} className="stat-card p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {(p.images?.[0] || p.image) && (
                  <img src={p.images?.[0] || p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover border" />
                )}
                <div>
                  <h3 className="font-medium text-sm">{p.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.category} · {p.subcategory}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => updateProductMut.mutate({ id: p.id, updates: { trending: !p.trending } })} className={`p-1.5 rounded-lg ${p.trending ? 'text-orange-500 bg-orange-500/10' : 'hover:text-orange-500 hover:bg-orange-500/10'}`} title="Trending"><Flame className="h-4 w-4" /></button>
                <button onClick={() => openEdit(p)} className="p-1.5 hover:text-primary rounded-lg hover:bg-primary/10"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => { deleteProductMut.mutate(p.id); toast.success(t('prod.deleted')); }} className="p-1.5 hover:text-destructive rounded-lg hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <Badge variant="outline" className="text-[10px]">{p.barcode}</Badge>
              <span className={`font-medium ${p.stock < 20 ? 'text-destructive' : 'text-muted-foreground'}`}>{t('prod.stock')}: {p.stock}</span>
              {(p.images?.length || 0) > 0 && <Badge variant="secondary" className="text-[10px]">📷 {p.images.length}</Badge>}
              {p.source === 'fb' && <Badge className="text-[10px] bg-[#1877F2] text-white hover:bg-[#1877F2]">FB</Badge>}
              {p.source === 'pos' && <Badge variant="secondary" className="text-[10px]">POS</Badge>}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-primary">৳{p.price.toFixed(0)}</span>
              <span className="text-xs text-muted-foreground">{t('prod.buyPrice')}: ৳{p.buyingPrice.toFixed(0)}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">{t('prod.noProducts')}</div>}
      </div>

      {/* Desktop */}
      <div className="hidden sm:block stat-card overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-3 font-medium">{t('prod.product')}</th>
              <th className="pb-3 font-medium">{t('prod.barcode')}</th>
              <th className="pb-3 font-medium">{t('prod.category')}</th>
              <th className="pb-3 font-medium">{t('prod.subcategory')}</th>
              <th className="pb-3 font-medium text-right">{t('prod.price')}</th>
              <th className="pb-3 font-medium text-right">{t('prod.buyPrice')}</th>
              <th className="pb-3 font-medium text-right">{t('prod.stock')}</th>
              <th className="pb-3 font-medium text-right">{t('prod.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-3 font-medium">
                  <div className="flex items-center gap-2">
                    {(p.images?.[0] || p.image) && <img src={p.images?.[0] || p.image} alt="" className="w-8 h-8 rounded-md object-cover border" />}
                    <span>{p.name}</span>
                    {p.source === 'fb' && <Badge className="text-[9px] h-4 px-1 bg-[#1877F2] text-white hover:bg-[#1877F2]">FB</Badge>}
                    {p.source === 'pos' && <Badge variant="secondary" className="text-[9px] h-4 px-1">POS</Badge>}
                  </div>
                </td>
                <td className="py-3 font-mono text-xs">{p.barcode}</td>
                <td className="py-3"><Badge variant="outline" className="text-xs">{p.category}</Badge></td>
                <td className="py-3 text-xs text-muted-foreground">{p.subcategory}</td>
                <td className="py-3 text-right">৳{p.price.toFixed(0)}</td>
                <td className="py-3 text-right text-muted-foreground">৳{p.buyingPrice.toFixed(0)}</td>
                <td className={`py-3 text-right font-medium ${p.stock < 20 ? 'text-destructive' : ''}`}>{p.stock}</td>
                <td className="py-3 text-right">
                  <button onClick={() => updateProductMut.mutate({ id: p.id, updates: { trending: !p.trending } })} className={`p-1 ${p.trending ? 'text-orange-500' : 'hover:text-orange-500'}`} title="Trending"><Flame className="h-4 w-4" /></button>
                  <button onClick={() => openEdit(p)} className="p-1 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => { deleteProductMut.mutate(p.id); toast.success(t('prod.deleted')); }} className="p-1 hover:text-destructive ml-1"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">{t('prod.noProducts')}</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editProduct ? t('prod.editProduct') : t('prod.newProduct')}</DialogTitle></DialogHeader>
          <div className="grid gap-3 max-h-[70vh] overflow-auto pr-1">
            <div><Label>{t('prod.name')}</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>{t('prod.description')}</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div>
              <Label>{t('prod.image')} ({form.images.length})</Label>
              <MultiImageUpload images={form.images} onChange={(imgs) => setForm(f => ({ ...f, images: imgs, image: imgs[0] || '' }))} uploadLabel={t('prod.uploadPhoto')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{t('prod.sellingPrice')}</Label><Input type="number" step="1" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
              <div><Label>{t('prod.buyingPrice')}</Label><Input type="number" step="1" value={form.buyingPrice} onChange={e => setForm(f => ({ ...f, buyingPrice: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{t('prod.barcode')}</Label><Input value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} /></div>
              <div><Label>{t('prod.stock')}</Label><Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t('prod.category')}</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.category} onChange={e => handleCategoryChange(e.target.value)}>
                  <option value="">{t('prod.selectCategory')}</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <Label>{t('prod.subcategory')}</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.subcategory} onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}>
                  <option value="">{t('prod.selectSubcategory')}</option>
                  {subcategories.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                </select>
              </div>
            </div>
            <Button onClick={handleSave} className="mt-2">{editProduct ? t('prod.update') : t('prod.add')} {t('prod.product')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
