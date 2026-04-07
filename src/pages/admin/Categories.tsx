import { useState } from 'react';
import { useStore, Category } from '@/data/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, X, FolderPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function Categories() {
  const { categories, products, addCategory, updateCategory, deleteCategory, addSubcategory, removeSubcategory } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('📦');
  const [subInput, setSubInput] = useState<Record<string, string>>({});

  const openNew = () => {
    setEditCat(null);
    setCatName('');
    setCatIcon('📦');
    setDialogOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditCat(c);
    setCatName(c.name);
    setCatIcon(c.icon);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!catName.trim()) return;
    if (editCat) {
      updateCategory(editCat.id, { name: catName.trim(), icon: catIcon });
      toast.success('Category updated');
    } else {
      addCategory(catName.trim(), catIcon);
      toast.success('Category added');
    }
    setDialogOpen(false);
  };

  const handleAddSub = (catId: string) => {
    const val = subInput[catId]?.trim();
    if (!val) {
      toast.error('Please enter a subcategory name');
      return;
    }
    const cat = categories.find(c => c.id === catId);
    if (cat?.subcategories.includes(val)) {
      toast.error('This subcategory already exists');
      return;
    }
    addSubcategory(catId, val);
    setSubInput(s => ({ ...s, [catId]: '' }));
    toast.success('Subcategory added');
  };

  const handleDeleteCat = (c: Category) => {
    const productCount = products.filter(p => p.category === c.name).length;
    if (productCount > 0) {
      toast.error(`Cannot delete: ${productCount} products in this category`);
      return;
    }
    deleteCategory(c.id);
    toast.success('Category deleted');
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header">Categories</h1>
          <p className="page-subheader">{categories.length} categories</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Add Category</Button>
      </div>

      <div className="grid gap-4">
        {categories.map(c => {
          const catProducts = products.filter(p => p.category === c.name);
          return (
            <div key={c.id} className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{c.icon}</span>
                  <div>
                    <h3 className="font-semibold text-base">{c.name}</h3>
                    <p className="text-xs text-muted-foreground">{catProducts.length} products</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDeleteCat(c)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Subcategories */}
              <div className="mb-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Subcategories</p>
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
                            if (scProducts > 0) { toast.error(`Cannot delete: ${scProducts} products in this subcategory`); return; }
                            removeSubcategory(c.id, sc);
                            toast.success('Subcategory removed');
                          }}
                          className="ml-0.5 p-0.5 rounded hover:bg-destructive/20 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                  {c.subcategories.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">No subcategories</span>
                  )}
                </div>
              </div>

              {/* Add subcategory inline */}
              <div className="flex gap-2">
                <Input
                  placeholder="New subcategory name..."
                  className="h-8 text-sm"
                  value={subInput[c.id] || ''}
                  onChange={e => setSubInput(s => ({ ...s, [c.id]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleAddSub(c.id)}
                />
                <Button type="button" size="sm" variant="outline" className="h-8 shrink-0" onClick={() => handleAddSub(c.id)}>
                  <FolderPlus className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
              </div>

              {/* Products in this category */}
              {catProducts.length > 0 && (
                <div className="mt-4 border-t pt-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Products in this category</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {catProducts.map(p => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-xs">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{p.name}</p>
                          <p className="text-muted-foreground">{p.subcategory}</p>
                        </div>
                        <span className="font-semibold text-primary shrink-0 ml-2">${p.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add/Edit Category Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editCat ? 'Edit Category' : 'New Category'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label>Category Name</Label>
              <Input value={catName} onChange={e => setCatName(e.target.value)} placeholder="e.g. Electronics" />
            </div>
            <div>
              <Label>Icon (emoji)</Label>
              <Input value={catIcon} onChange={e => setCatIcon(e.target.value)} placeholder="📦" className="w-20" />
            </div>
            <Button onClick={handleSave}>{editCat ? 'Update' : 'Create'} Category</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
