import { useState, useRef } from 'react';
import { useStore, Category } from '@/data/store';
import { useLanguage } from '@/data/language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, X, FolderPlus, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function Categories() {
  const categories = useStore(s => s.categories);
  const products = useStore(s => s.products);
  const addCategory = useStore(s => s.addCategory);
  const updateCategory = useStore(s => s.updateCategory);
  const deleteCategory = useStore(s => s.deleteCategory);
  const addSubcategory = useStore(s => s.addSubcategory);
  const removeSubcategory = useStore(s => s.removeSubcategory);
  const { t } = useLanguage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('📦');
  const [catImage, setCatImage] = useState('');
  const [subInput, setSubInput] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openNew = () => { setEditCat(null); setCatName(''); setCatIcon('📦'); setCatImage(''); setDialogOpen(true); };
  const openEdit = (c: Category) => { setEditCat(c); setCatName(c.name); setCatIcon(c.icon); setCatImage(c.image || ''); setDialogOpen(true); };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Max 2MB'); return; }
    const reader = new FileReader();
    reader.onload = () => setCatImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!catName.trim()) return;
    if (editCat) {
      updateCategory(editCat.id, { name: catName.trim(), icon: catIcon, image: catImage || undefined });
      toast.success(t('cat.categoryUpdated'));
    } else {
      addCategory(catName.trim(), catIcon, catImage || undefined);
      toast.success(t('cat.categoryAdded'));
    }
    setDialogOpen(false);
  };

  const handleAddSub = (catId: string) => {
    const val = subInput[catId]?.trim();
    if (!val) { toast.error(t('cat.enterSubName')); return; }
    const cat = categories.find(c => c.id === catId);
    if (cat?.subcategories.includes(val)) { toast.error(t('cat.subExists')); return; }
    addSubcategory(catId, val);
    setSubInput(s => ({ ...s, [catId]: '' }));
    toast.success(t('cat.subAdded'));
  };

  const handleDeleteCat = (c: Category) => {
    const productCount = products.filter(p => p.category === c.name).length;
    if (productCount > 0) { toast.error(t('cat.cantDelete', { n: productCount })); return; }
    deleteCategory(c.id);
    toast.success(t('cat.catDeleted'));
  };

  const CategoryIcon = ({ cat }: { cat: Category }) => {
    if (cat.image) {
      return <img src={cat.image} alt={cat.name} className="h-10 w-10 rounded-xl object-cover" />;
    }
    return <span className="text-2xl">{cat.icon}</span>;
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header">{t('cat.title')}</h1>
          <p className="page-subheader">{t('cat.nCategories', { n: categories.length })}</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> {t('cat.addCategory')}</Button>
      </div>

      <div className="grid gap-4">
        {categories.map(c => {
          const catProducts = products.filter(p => p.category === c.name);
          return (
            <div key={c.id} className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <CategoryIcon cat={c} />
                  <div>
                    <h3 className="font-semibold text-base">{c.name}</h3>
                    <p className="text-xs text-muted-foreground">{t('cat.nProducts', { n: catProducts.length })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDeleteCat(c)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">{t('cat.subcategories')}</p>
                <div className="flex flex-wrap gap-2">
                  {c.subcategories.map(sc => {
                    const subCount = catProducts.filter(p => p.subcategory === sc).length;
                    return (
                      <Badge key={sc} variant="secondary" className="gap-1.5 pr-1">
                        {sc}
                        <span className="text-[10px] text-muted-foreground">({subCount})</span>
                        <button
                          onClick={() => {
                            const scProducts = catProducts.filter(p => p.subcategory === sc).length;
                            if (scProducts > 0) { toast.error(t('cat.cantDeleteSub', { n: scProducts })); return; }
                            removeSubcategory(c.id, sc);
                            toast.success(t('cat.subRemoved'));
                          }}
                          className="ml-0.5 p-0.5 rounded hover:bg-destructive/20 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                  {c.subcategories.length === 0 && <span className="text-xs text-muted-foreground italic">{t('cat.noSubcategories')}</span>}
                </div>
              </div>

              <div className="flex gap-2">
                <Input placeholder={t('cat.newSubcategory')} className="h-8 text-sm" value={subInput[c.id] || ''} onChange={e => setSubInput(s => ({ ...s, [c.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleAddSub(c.id)} />
                <Button type="button" size="sm" variant="outline" className="h-8 shrink-0" onClick={() => handleAddSub(c.id)}>
                  <FolderPlus className="h-3.5 w-3.5 mr-1" /> {t('cat.addSub')}
                </Button>
              </div>

              {catProducts.length > 0 && (
                <div className="mt-4 border-t pt-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">{t('cat.productsInCat')}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {catProducts.map(p => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-xs">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{p.name}</p>
                          <p className="text-muted-foreground">{p.subcategory}</p>
                        </div>
                        <span className="font-semibold text-primary shrink-0 ml-2">৳{p.price.toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editCat ? t('cat.editCategory') : t('cat.newCategory')}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div><Label>{t('cat.categoryName')}</Label><Input value={catName} onChange={e => setCatName(e.target.value)} placeholder={t('cat.namePlaceholder')} /></div>
            <div><Label>{t('cat.icon')}</Label><Input value={catIcon} onChange={e => setCatIcon(e.target.value)} placeholder="📦" className="w-20" /></div>

            {/* Image upload */}
            <div>
              <Label>{t('cat.image') || 'Category Image'}</Label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              {catImage ? (
                <div className="mt-2 relative inline-block">
                  <img src={catImage} alt="Category" className="h-20 w-20 rounded-xl object-cover border" />
                  <button onClick={() => setCatImage('')} className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-colors text-sm text-muted-foreground"
                >
                  <ImagePlus className="h-4 w-4" />
                  {t('cat.uploadImage') || 'Upload Image'}
                </button>
              )}
            </div>

            <Button onClick={handleSave}>{editCat ? t('cat.update') : t('cat.create')} {t('cat.title')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
