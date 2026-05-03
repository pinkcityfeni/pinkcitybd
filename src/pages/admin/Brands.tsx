import { useState } from 'react';
import type { Brand } from '@/data/store';
import { useBrands, useAddBrand, useUpdateBrand, useDeleteBrand, useProducts, useCategories } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const PRESET_COLORS = ['#ec4899', '#a78bfa', '#14b8a6', '#f97316', '#3b82f6', '#10b981', '#f43f5e', '#8b5cf6'];

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function Brands() {
  const { data: brands = [] } = useBrands();
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const addBrandMut = useAddBrand();
  const updateBrandMut = useUpdateBrand();
  const deleteBrandMut = useDeleteBrand();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editBrand, setEditBrand] = useState<Brand | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);

  const openNew = () => { setEditBrand(null); setName(''); setColor(PRESET_COLORS[0]); setDialogOpen(true); };
  const openEdit = (b: Brand) => { setEditBrand(b); setName(b.name); setColor(b.color); setDialogOpen(true); };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) { toast.error('Brand name দিন'); return; }
    if (editBrand) {
      updateBrandMut.mutate({ id: editBrand.id, updates: { name: trimmed, color } });
      toast.success('Brand update হয়েছে');
    } else {
      addBrandMut.mutate({ name: trimmed, slug: slugify(trimmed), color });
      toast.success('নতুন brand যোগ হয়েছে');
    }
    setDialogOpen(false);
  };

  const requestDelete = (b: Brand) => {
    if (b.isDefault) { toast.error('Default brand delete করা যাবে না'); return; }
    const productCount = products.filter(p => p.brandId === b.id).length;
    const catCount = categories.filter(c => c.brandId === b.id).length;
    if (productCount > 0 || catCount > 0) {
      toast.error(`এই brand এ ${productCount}টি product ও ${catCount}টি category আছে। আগে move/delete করুন।`);
      return;
    }
    setDeleteTarget(b);
  };
  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteBrandMut.mutate(deleteTarget.id);
    toast.success('Brand delete হয়েছে');
    setDeleteTarget(null);
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header">Brands</h1>
          <p className="page-subheader">{brands.length} টি brand</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> নতুন Brand</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map(b => {
          const productCount = products.filter(p => p.brandId === b.id).length;
          const catCount = categories.filter(c => c.brandId === b.id).length;
          const stockValue = products.filter(p => p.brandId === b.id).reduce((s, p) => s + p.buyingPrice * p.stock, 0);
          return (
            <div key={b.id} className="stat-card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: b.color }}
                  >
                    <Tag className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base flex items-center gap-2">
                      {b.name}
                      {b.isDefault && <Badge variant="secondary" className="text-[9px]">DEFAULT</Badge>}
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-mono">{b.slug}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary"><Pencil className="h-4 w-4" /></button>
                  {!b.isDefault && (
                    <button onClick={() => requestDelete(b)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-muted/50 p-2">
                  <div className="text-base font-bold">{productCount}</div>
                  <div className="text-[10px] text-muted-foreground">Products</div>
                </div>
                <div className="rounded-lg bg-muted/50 p-2">
                  <div className="text-base font-bold">{catCount}</div>
                  <div className="text-[10px] text-muted-foreground">Categories</div>
                </div>
                <div className="rounded-lg bg-muted/50 p-2">
                  <div className="text-base font-bold text-primary">৳{stockValue.toFixed(0)}</div>
                  <div className="text-[10px] text-muted-foreground">Stock Value</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editBrand ? 'Brand Edit' : 'নতুন Brand'}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label>Brand Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="যেমন Pastel" />
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-full border-2 ${color === c ? 'border-foreground scale-110' : 'border-transparent'} transition-all`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <Button onClick={handleSave}>{editBrand ? 'Update' : 'Create'} Brand</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Brand ডিলিট করবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && <><strong>{deleteTarget.name}</strong> ডিলিট করা হবে। এই কাজ আর ফেরানো যাবে না।</>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={confirmDelete}>ডিলিট করুন</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}