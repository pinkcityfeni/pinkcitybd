import { useState, useRef } from 'react';
import { Product } from '@/data/store';
import { useProducts, useCategories, useAddProduct, useUpdateProduct, useDeleteProduct, uploadImage, useBrands, useDefaultBrand } from '@/hooks/useSupabaseData';
import { useLanguage } from '@/data/language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Search, Camera, X as XIcon, Flame } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { BrandFilter } from '@/components/admin/BrandFilter';
import BarcodeScannerDialog from '@/components/admin/BarcodeScannerDialog';

const EMPTY_FORM = { name: '', description: '', price: '', compareAtPrice: '', buyingPrice: '', barcode: '', category: '', subcategory: '', stock: '', image: '', images: [] as string[], brandId: '' };

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
  const { data: brands = [] } = useBrands();
  const defaultBrand = useDefaultBrand();
  const addProductMut = useAddProduct();
  const updateProductMut = useUpdateProduct();
  const deleteProductMut = useDeleteProduct();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [duplicateWarning, setDuplicateWarning] = useState<Product | null>(null);
  const [duplicateBarcode, setDuplicateBarcode] = useState<Product | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [captionText, setCaptionText] = useState('');

  const handleParseCaption = () => {
    const text = captionText.trim();
    if (!text) { toast.error('আগে caption paste করুন'); return; }
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const name = lines[0]?.slice(0, 80) || '';
    const description = lines.slice(1).join('\n').trim() || lines[0] || '';
    const priceMatch = text.match(/(?:৳|tk|টাকা|price[\s:]+)\s*(\d{2,6})/i)
      || text.match(/\b(\d{2,5})\s*(?:tk|টাকা|৳)/i);
    const price = priceMatch ? priceMatch[1] : '';
    const compareMatch = text.match(/(?:was|আগে|original|আসল|reg(?:ular)?)\s*[:\-]?\s*(?:৳|tk|টাকা)?\s*(\d{2,6})/i)
      || text.match(/~~\s*(?:৳|tk)?\s*(\d{2,6})\s*~~/i);
    const compareAt = compareMatch ? compareMatch[1] : '';
    setForm(f => ({
      ...f,
      name: name || f.name,
      description: description || f.description,
      price: price || f.price,
      compareAtPrice: compareAt || f.compareAtPrice,
    }));
    toast.success('Caption parse হয়েছে');
  };

  const filtered = products.filter(p => {
    if (filterBrand && p.brandId !== filterBrand) return false;
    if (filterCat && p.category !== filterCat) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.barcode.includes(search)) return false;
    return true;
  });

  // Categories filtered by selected brand
  const formBrandCategories = form.brandId ? categories.filter(c => c.brandId === form.brandId) : categories;
  const filterBrandCategories = filterBrand ? categories.filter(c => c.brandId === filterBrand) : categories;
  const selectedCat = categories.find(c => c.name === form.category && (!form.brandId || c.brandId === form.brandId));
  const subcategories = selectedCat?.subcategories || [];

  const openNew = () => {
    setEditProduct(null);
    const brandId = filterBrand || defaultBrand?.id || '';
    const brandCats = brandId ? categories.filter(c => c.brandId === brandId) : categories;
    setForm({ ...EMPTY_FORM, brandId, category: brandCats[0]?.name || '', subcategory: brandCats[0]?.subcategories[0] || '' });
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({ name: p.name, description: p.description, price: String(p.price), compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : '', buyingPrice: String(p.buyingPrice), barcode: p.barcode, category: p.category, subcategory: p.subcategory, stock: String(p.stock), image: p.image, images: p.images || [], brandId: p.brandId || defaultBrand?.id || '' });
    setDialogOpen(true);
  };

  const performSave = () => {
    const compareAt = Number(form.compareAtPrice) || 0;
    const sellPrice = Number(form.price);
    const allImages = form.images;
    const mainImage = allImages[0] || form.image || '';
    const data: Omit<Product, 'id'> = { name: form.name, description: form.description, price: sellPrice, compareAtPrice: compareAt, buyingPrice: Number(form.buyingPrice), barcode: form.barcode, category: form.category, subcategory: form.subcategory, stock: Number(form.stock), image: mainImage, images: allImages, source: editProduct?.source || 'manual', brandId: form.brandId };
    if (editProduct) { updateProductMut.mutate({ id: editProduct.id, updates: data }); toast.success(t('prod.updated')); }
    else { addProductMut.mutate(data); toast.success(t('prod.added')); }
    setDialogOpen(false);
    setDuplicateWarning(null);
    setDuplicateBarcode(null);
  };

  const handleSave = () => {
    if (!form.name || !form.price || !form.category) { toast.error(t('prod.fillRequired')); return; }
    if (!form.brandId) { toast.error('Brand select করুন'); return; }
    const compareAt = Number(form.compareAtPrice) || 0;
    const sellPrice = Number(form.price);
    if (compareAt > 0 && compareAt <= sellPrice) {
      toast.error('পুরাতন দাম বর্তমান দামের চেয়ে বেশি হতে হবে');
      return;
    }
    if (!editProduct) {
      const dup = products.find(p => p.name.trim().toLowerCase() === form.name.trim().toLowerCase());
      if (dup) { setDuplicateWarning(dup); return; }
    }
    if (form.barcode.trim()) {
      const dupBc = products.find(p => p.barcode.trim() === form.barcode.trim() && p.id !== editProduct?.id);
      if (dupBc) { setDuplicateBarcode(dupBc); return; }
    }
    performSave();
  };

  const handleBarcodeDetected = (code: string) => {
    setForm(f => ({ ...f, barcode: code }));
    const existing = products.find(p => p.barcode.trim() === code.trim() && p.id !== editProduct?.id);
    if (existing) {
      toast.warning(`এই barcode আগে থেকেই আছে: ${existing.name}`);
    } else {
      toast.success('Barcode scan হয়েছে');
    }
  };

  const handleCategoryChange = (catName: string) => {
    const cat = categories.find(c => c.name === catName && (!form.brandId || c.brandId === form.brandId));
    setForm(f => ({ ...f, category: catName, subcategory: cat?.subcategories[0] || '' }));
  };

  const handleBrandChange = (brandId: string) => {
    const brandCats = categories.filter(c => c.brandId === brandId);
    setForm(f => ({ ...f, brandId, category: brandCats[0]?.name || '', subcategory: brandCats[0]?.subcategories[0] || '' }));
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

      <div className="mb-3">
        <BrandFilter value={filterBrand} onChange={(b) => { setFilterBrand(b); setFilterCat(''); }} allLabel="All Brands" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder={t('prod.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant={!filterCat ? 'default' : 'outline'} size="sm" onClick={() => setFilterCat('')}>{t('general.all')}</Button>
          {filterBrandCategories.map(c => (
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
                  <h3 className="font-medium text-sm flex items-center gap-1.5 flex-wrap">
                    {p.name}
                    {(() => { const b = brands.find(x => x.id === p.brandId); return b ? <span className="text-[9px] font-semibold text-white px-1.5 py-0 rounded-full" style={{ backgroundColor: b.color }}>{b.name}</span> : null; })()}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.category} · {p.subcategory}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => updateProductMut.mutate({ id: p.id, updates: { trending: !p.trending } })} className={`p-1.5 rounded-lg ${p.trending ? 'text-orange-500 bg-orange-500/10' : 'hover:text-orange-500 hover:bg-orange-500/10'}`} title="Trending"><Flame className="h-4 w-4" /></button>
                <button onClick={() => openEdit(p)} className="p-1.5 hover:text-primary rounded-lg hover:bg-primary/10"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => setDeleteTarget(p)} className="p-1.5 hover:text-destructive rounded-lg hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
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
                    {(() => { const b = brands.find(x => x.id === p.brandId); return b ? <span className="text-[9px] font-semibold text-white px-1.5 py-0 rounded-full" style={{ backgroundColor: b.color }}>{b.name}</span> : null; })()}
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
                  <button onClick={() => setDeleteTarget(p)} className="p-1 hover:text-destructive ml-1"><Trash2 className="h-4 w-4" /></button>
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
            <div>
              <Label>Brand <span className="text-destructive">*</span></Label>
              <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.brandId} onChange={e => handleBrandChange(e.target.value)}>
                <option value="">-- Brand --</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
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
            <div>
              <Label>পুরাতন দাম / MRP <span className="text-muted-foreground text-xs">(ঐচ্ছিক — ডিসকাউন্ট দেখাতে)</span></Label>
              <Input type="number" step="1" placeholder="যেমন 700" value={form.compareAtPrice} onChange={e => setForm(f => ({ ...f, compareAtPrice: e.target.value }))} />
              <p className="text-[11px] text-muted-foreground mt-1">সেলিং দামের চেয়ে বেশি দিলে কাস্টমার কাটা দাগ ও ডিসকাউন্ট % দেখবে। খালি রাখলে কিছু দেখাবে না।</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t('prod.barcode')}</Label>
                <div className="flex gap-1.5">
                  <Input value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} />
                  <Button type="button" variant="outline" size="icon" onClick={() => setScannerOpen(true)} title="Scan barcode">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div><Label>{t('prod.stock')}</Label><Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t('prod.category')}</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.category} onChange={e => handleCategoryChange(e.target.value)}>
                  <option value="">{t('prod.selectCategory')}</option>
                  {formBrandCategories.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
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

      <AlertDialog open={!!duplicateWarning} onOpenChange={(o) => { if (!o) setDuplicateWarning(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ একই নামের প্রোডাক্ট আছে</AlertDialogTitle>
            <AlertDialogDescription>
              {duplicateWarning && (
                <>
                  এই নামে একটি প্রোডাক্ট আগে থেকেই আছে —{' '}
                  <strong>{duplicateWarning.name}</strong>
                  {' '}({(brands.find(b => b.id === duplicateWarning.brandId)?.name) || '—'} · {duplicateWarning.category} · Stock: {duplicateWarning.stock} · ৳{duplicateWarning.price.toFixed(0)}).
                  <br /><br />
                  আপনি কি তবুও নতুন প্রোডাক্ট হিসেবে add করতে চান?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>না, বাতিল করুন</AlertDialogCancel>
            <AlertDialogAction onClick={performSave}>হ্যাঁ, add করুন</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!duplicateBarcode} onOpenChange={(o) => { if (!o) setDuplicateBarcode(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ একই Barcode-এর প্রোডাক্ট আছে</AlertDialogTitle>
            <AlertDialogDescription>
              {duplicateBarcode && (
                <>
                  এই barcode <strong>#{duplicateBarcode.barcode}</strong> আগে থেকেই use হয়েছে —{' '}
                  <strong>{duplicateBarcode.name}</strong>
                  {' '}({(brands.find(b => b.id === duplicateBarcode.brandId)?.name) || '—'} · {duplicateBarcode.category} · Stock: {duplicateBarcode.stock} · ৳{duplicateBarcode.price.toFixed(0)}).
                  <br /><br />
                  Barcode unique রাখাই ভাল। তবুও কি save করতে চান?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>না, ঠিক করি</AlertDialogCancel>
            <AlertDialogAction onClick={performSave}>হ্যাঁ, save করুন</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>প্রোডাক্ট ডিলিট করবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  <strong>{deleteTarget.name}</strong> ডিলিট করা হবে। এই কাজ আর ফেরানো যাবে না।
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  deleteProductMut.mutate(deleteTarget.id);
                  toast.success(t('prod.deleted'));
                }
                setDeleteTarget(null);
              }}
            >
              ডিলিট করুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BarcodeScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onDetected={handleBarcodeDetected}
      />
    </div>
  );
}
