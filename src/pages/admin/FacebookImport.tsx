import { useState, useMemo } from 'react';
import { useCategories, useAddProduct, uploadImage } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Facebook, Plus, X as XIcon, Image as ImageIcon, ChevronDown, ChevronUp, Loader2,
  CheckCircle2, AlertCircle, Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/data/store';

const EMPTY = {
  name: '', description: '', price: '', buyingPrice: '', stock: '10',
  barcode: '', category: '', subcategory: '', imageUrls: [] as string[],
};

// ---------- Image persistence (shared) ----------
async function persistFbImages(urls: string[]): Promise<string[]> {
  const persisted: string[] = [];
  for (const url of urls) {
    try {
      if (url.includes('supabase.co/storage')) { persisted.push(url); continue; }
      const res = await fetch(url);
      if (!res.ok) throw new Error('fetch failed');
      const blob = await res.blob();
      const ext = blob.type.split('/')[1] || 'jpg';
      const file = new File([blob], `fb-${Date.now()}.${ext}`, { type: blob.type });
      const newUrl = await uploadImage(file);
      persisted.push(newUrl);
    } catch {
      persisted.push(url);
    }
  }
  return persisted;
}

// ---------- Bulk parser ----------
type RowStatus = 'pending' | 'importing' | 'success' | 'failed';
interface DraftRow {
  id: string;
  selected: boolean;
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  imageUrls: string[];
  status: RowStatus;
  error?: string;
}

function parseBulkText(text: string, defaultStock: string, defaultCategory: string): DraftRow[] {
  const blocks = text.split(/\n\s*---\s*\n/).map(b => b.trim()).filter(Boolean);
  return blocks.map((block, idx) => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    const imageUrls: string[] = [];
    const textLines: string[] = [];
    for (const line of lines) {
      const imgMatch = line.match(/^IMG\s*[:\-]\s*(https?:\/\/\S+)/i);
      if (imgMatch) imageUrls.push(imgMatch[1]);
      else textLines.push(line);
    }
    const name = textLines[0]?.slice(0, 80) || '';
    const rest = textLines.slice(1).join('\n');
    const priceMatch = rest.match(/(?:৳|tk|টাকা|price[\s:]+)\s*(\d{2,6})/i)
      || rest.match(/\b(\d{2,5})\s*(?:tk|টাকা|৳)/i)
      || block.match(/\b(\d{2,5})\s*(?:tk|টাকা|৳)/i);
    const price = priceMatch ? priceMatch[1] : '';
    const description = rest.replace(/(?:price[\s:]+)\s*\d{2,6}/gi, '').trim();
    return {
      id: `${Date.now()}-${idx}`,
      selected: true,
      name, description, price,
      stock: defaultStock, category: defaultCategory,
      imageUrls, status: 'pending' as RowStatus,
    };
  });
}

export default function FacebookImport() {
  const { data: categories = [] } = useCategories();
  const addProductMut = useAddProduct();

  // ===== Single import state =====
  const [pastedText, setPastedText] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [importing, setImporting] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const selectedCat = categories.find(c => c.name === form.category);
  const subcategories = selectedCat?.subcategories || [];

  const handleParseText = () => {
    if (!pastedText.trim()) { toast.error('আগে post-এর text paste করুন'); return; }
    const lines = pastedText.split('\n').map(l => l.trim()).filter(Boolean);
    const name = lines[0]?.slice(0, 80) || '';
    const description = lines.slice(1).join('\n').trim() || lines[0] || '';
    const priceMatch = pastedText.match(/(?:৳|tk|টাকা|price[\s]+)\s*(\d{2,6})/i) || pastedText.match(/\b(\d{2,5})\s*(?:tk|টাকা|৳)/i);
    const price = priceMatch ? priceMatch[1] : '';
    setForm(f => ({ ...f, name, description, price: price || f.price }));
    toast.success('Text parse হয়েছে');
  };

  const removeImage = (i: number) => {
    setForm(f => ({ ...f, imageUrls: f.imageUrls.filter((_, idx) => idx !== i) }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); continue; }
      try {
        const url = await uploadImage(file);
        setForm(f => ({ ...f, imageUrls: [...f.imageUrls, url] }));
      } catch { toast.error('Upload failed'); }
    }
    e.target.value = '';
  };

  const handleImport = async () => {
    if (!form.name.trim()) { toast.error('Product name দিন'); return; }
    if (!form.price || Number(form.price) <= 0) { toast.error('Selling price দিন'); return; }
    if (!form.category) { toast.error('Category select করুন'); return; }
    if (form.imageUrls.length === 0) { toast.error('কমপক্ষে ১টা ছবি দিন'); return; }
    setImporting(true);
    try {
      const finalImages = await persistFbImages(form.imageUrls);
      const data: Omit<Product, 'id'> = {
        name: form.name.trim(), description: form.description.trim(),
        price: Number(form.price), buyingPrice: Number(form.buyingPrice) || 0,
        barcode: form.barcode.trim(), category: form.category, subcategory: form.subcategory,
        stock: Number(form.stock) || 0,
        image: finalImages[0], images: finalImages, trending: false,
      };
      await addProductMut.mutateAsync(data);
      toast.success(`✅ "${form.name}" add হয়েছে!`);
      setForm(EMPTY); setPastedText('');
    } catch (err: any) {
      toast.error('Import failed: ' + (err?.message || 'unknown error'));
    } finally { setImporting(false); }
  };

  const handleCategoryChange = (catName: string) => {
    const cat = categories.find(c => c.name === catName);
    setForm(f => ({ ...f, category: catName, subcategory: cat?.subcategories[0] || '' }));
  };

  // ===== Bulk import state =====
  const [bulkText, setBulkText] = useState('');
  const [defaultStock, setDefaultStock] = useState('10');
  const [defaultCategory, setDefaultCategory] = useState('');
  const [rows, setRows] = useState<DraftRow[]>([]);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });
  const [showBulkGuide, setShowBulkGuide] = useState(false);

  const validRows = useMemo(
    () => rows.filter(r => r.name && Number(r.price) > 0 && r.imageUrls.length > 0 && r.category),
    [rows]
  );
  const selectedValidRows = validRows.filter(r => r.selected && r.status !== 'success');

  const handleParseBulk = () => {
    if (!bulkText.trim()) { toast.error('আগে posts paste করুন'); return; }
    const parsed = parseBulkText(bulkText, defaultStock, defaultCategory);
    if (parsed.length === 0) { toast.error('কোনো post detect করতে পারিনি'); return; }
    setRows(parsed);
    toast.success(`${parsed.length}টি post parse হয়েছে — table-এ check করুন`);
  };

  const updateRow = (id: string, patch: Partial<DraftRow>) => {
    setRows(rs => rs.map(r => r.id === id ? { ...r, ...patch } : r));
  };

  const removeRow = (id: string) => setRows(rs => rs.filter(r => r.id !== id));

  const toggleAll = (checked: boolean) => {
    setRows(rs => rs.map(r => r.status === 'success' ? r : { ...r, selected: checked }));
  };

  const applyCategoryToSelected = () => {
    if (!defaultCategory) { toast.error('আগে একটা default category select করুন'); return; }
    setRows(rs => rs.map(r => r.selected && r.status !== 'success' ? { ...r, category: defaultCategory } : r));
    toast.success('Category apply হয়েছে');
  };

  const applyStockToSelected = () => {
    setRows(rs => rs.map(r => r.selected && r.status !== 'success' ? { ...r, stock: defaultStock } : r));
    toast.success('Stock apply হয়েছে');
  };

  const uploadRowImages = async (id: string, files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); continue; }
      try {
        const url = await uploadImage(file);
        setRows(rs => rs.map(r => r.id === id ? { ...r, imageUrls: [...r.imageUrls, url] } : r));
      } catch { toast.error('Upload failed'); }
    }
  };

  const removeRowImage = (id: string, idx: number) => {
    setRows(rs => rs.map(r => r.id === id
      ? { ...r, imageUrls: r.imageUrls.filter((_, i) => i !== idx) }
      : r));
  };

  const handleBulkImport = async () => {
    const targets = selectedValidRows;
    if (targets.length === 0) { toast.error('কোনো valid row select করা নেই'); return; }
    setBulkImporting(true);
    setBulkProgress({ done: 0, total: targets.length });
    let success = 0, failed = 0;
    for (let i = 0; i < targets.length; i++) {
      const row = targets[i];
      updateRow(row.id, { status: 'importing', error: undefined });
      try {
        const finalImages = await persistFbImages(row.imageUrls);
        const data: Omit<Product, 'id'> = {
          name: row.name.trim(), description: row.description.trim(),
          price: Number(row.price), buyingPrice: 0, barcode: '',
          category: row.category, subcategory: '',
          stock: Number(row.stock) || 0,
          image: finalImages[0], images: finalImages, trending: false,
        };
        await addProductMut.mutateAsync(data);
        updateRow(row.id, { status: 'success' });
        success++;
      } catch (err: any) {
        updateRow(row.id, { status: 'failed', error: err?.message || 'unknown' });
        failed++;
      }
      setBulkProgress({ done: i + 1, total: targets.length });
    }
    setBulkImporting(false);
    toast.success(`✅ ${success}টি import হয়েছে${failed ? `, ❌ ${failed}টি failed` : ''}`);
    // Auto-remove success rows after a moment
    setTimeout(() => setRows(rs => rs.filter(r => r.status !== 'success')), 2000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="page-header flex items-center gap-2">
          <Facebook className="h-6 w-6 text-[#1877F2]" />
          Facebook থেকে Product Import
        </h1>
        <p className="page-subheader">একটা একটা করে অথবা একসাথে অনেকগুলো post import করুন</p>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="single">Single Post</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Import 🚀</TabsTrigger>
        </TabsList>

        {/* ============ SINGLE TAB ============ */}
        <TabsContent value="single" className="space-y-6 mt-4">
          <Card className="p-4 bg-primary/5 border-primary/20">
            <button onClick={() => setShowGuide(s => !s)} className="flex items-center justify-between w-full text-left">
              <span className="font-semibold text-sm">📖 কিভাবে use করবেন? (step-by-step)</span>
              {showGuide ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showGuide && (
              <ol className="mt-3 space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>Facebook-এ আপনার page-এর post-টা open করুন।</li>
                <li>Post-এর <strong>text/caption</strong> select করে copy করুন → "Post Text" box-এ paste → <strong>"Auto-fill Form"</strong>।</li>
                <li>Post-এর <strong>ছবিতে right-click</strong> → "Copy image address" → image URL box-এ paste করে "Add"।</li>
                <li>অথবা ছবিটা download করে <strong>"Upload File"</strong> button দিয়ে upload করুন (recommended)।</li>
                <li>Price, stock, category check করে <strong>"Import as Product"</strong> চাপুন।</li>
              </ol>
            )}
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
              <h2 className="font-semibold">Post-এর Text Paste করুন</h2>
            </div>
            <Textarea rows={5}
              placeholder={`এখানে Facebook post-এর caption paste করুন...\n\nGold Plated Necklace Set\nসুন্দর design\nPrice: 1500 tk`}
              value={pastedText} onChange={e => setPastedText(e.target.value)} />
            <Button onClick={handleParseText} variant="secondary" size="sm">✨ Auto-fill Form</Button>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
              <h2 className="font-semibold">ছবি upload করুন</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-dashed cursor-pointer hover:bg-muted/50">
                <ImageIcon className="h-4 w-4" />
                <span>Upload ছবি (একাধিক select করতে পারেন)</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
            {form.imageUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {form.imageUrls.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border">
                    <img src={url} alt={`img ${i + 1}`} className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
                    <button onClick={() => removeImage(i)} className="absolute top-0.5 right-0.5 bg-background/80 rounded-full p-0.5 hover:bg-destructive hover:text-white">
                      <XIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
              <h2 className="font-semibold">Product Details</h2>
            </div>
            <div><Label>Product Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Selling Price (৳) *</Label>
                <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
              <div><Label>Buying Price (৳)</Label>
                <Input type="number" value={form.buyingPrice} onChange={e => setForm(f => ({ ...f, buyingPrice: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Stock</Label>
                <Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} /></div>
              <div><Label>Barcode</Label>
                <Input value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Category *</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.category} onChange={e => handleCategoryChange(e.target.value)}>
                  <option value="">-- select --</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div><Label>Subcategory</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.subcategory} onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}>
                  <option value="">-- select --</option>
                  {subcategories.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                </select>
              </div>
            </div>
            <Button onClick={handleImport} disabled={importing} className="w-full mt-2" size="lg">
              {importing
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importing...</>
                : <><Plus className="h-4 w-4 mr-2" /> Import as Product</>}
            </Button>
          </Card>
        </TabsContent>

        {/* ============ BULK TAB ============ */}
        <TabsContent value="bulk" className="space-y-4 mt-4">
          <Card className="p-4 bg-primary/5 border-primary/20">
            <button onClick={() => setShowBulkGuide(s => !s)} className="flex items-center justify-between w-full text-left">
              <span className="font-semibold text-sm">📖 Bulk format কিভাবে?</span>
              {showBulkGuide ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showBulkGuide && (
              <div className="mt-3 text-sm text-muted-foreground space-y-2">
                <p>প্রতিটা product আলাদা করার জন্য একটা লাইনে শুধু <code className="bg-muted px-1 rounded">---</code> দিন। ছবির URL <code className="bg-muted px-1 rounded">IMG:</code> দিয়ে শুরু করুন।</p>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">{`Gold Necklace Set
Beautiful party design
Price: 1500 tk
IMG: https://example.com/n1.jpg
IMG: https://example.com/n2.jpg
---
Pink Lipstick Matte
Long lasting color
Price: 350 tk
IMG: https://example.com/lip.jpg`}</pre>
                <p>Parse করার পর table-এ সব edit করতে পারবেন।</p>
              </div>
            )}
          </Card>

          {/* Paste area */}
          <Card className="p-4 space-y-3">
            <Label>একসাথে অনেকগুলো post paste করুন (<code className="bg-muted px-1 rounded text-xs">---</code> দিয়ে আলাদা)</Label>
            <Textarea rows={10} value={bulkText} onChange={e => setBulkText(e.target.value)}
              placeholder={`Product 1\nDescription\nPrice: 500 tk\nIMG: https://...\n---\nProduct 2\n...`} />
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <Label className="text-xs">Default Stock</Label>
                <Input type="number" className="w-24" value={defaultStock} onChange={e => setDefaultStock(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Default Category</Label>
                <select className="h-10 rounded-md border bg-background px-3 text-sm min-w-[180px]"
                  value={defaultCategory} onChange={e => setDefaultCategory(e.target.value)}>
                  <option value="">-- select --</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <Button onClick={handleParseBulk} variant="secondary">
                ✨ Parse posts
              </Button>
            </div>
          </Card>

          {/* Preview table */}
          {rows.length > 0 && (
            <Card className="p-4 space-y-3">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-2 pb-2 border-b">
                <span className="text-sm font-medium mr-2">
                  {rows.length} parsed · {validRows.length} valid · {selectedValidRows.length} selected
                </span>
                <Button size="sm" variant="outline" onClick={() => toggleAll(true)}>Select All</Button>
                <Button size="sm" variant="outline" onClick={() => toggleAll(false)}>Deselect All</Button>
                <Button size="sm" variant="outline" onClick={applyCategoryToSelected}>Apply Category</Button>
                <Button size="sm" variant="outline" onClick={applyStockToSelected}>Apply Stock</Button>
                <div className="ml-auto">
                  <Button size="sm" onClick={handleBulkImport} disabled={bulkImporting || selectedValidRows.length === 0}>
                    {bulkImporting
                      ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {bulkProgress.done}/{bulkProgress.total}</>
                      : <><Plus className="h-4 w-4 mr-2" /> Import {selectedValidRows.length} selected</>}
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead className="w-24">Images</TableHead>
                      <TableHead className="min-w-[180px]">Name *</TableHead>
                      <TableHead className="w-24">Price *</TableHead>
                      <TableHead className="w-20">Stock</TableHead>
                      <TableHead className="min-w-[140px]">Category *</TableHead>
                      <TableHead className="w-20">Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map(row => {
                      const invalid = !row.name || !(Number(row.price) > 0) || row.imageUrls.length === 0 || !row.category;
                      return (
                        <TableRow key={row.id}
                          className={
                            row.status === 'success' ? 'bg-green-500/10' :
                            row.status === 'failed' ? 'bg-destructive/10' :
                            invalid ? 'bg-amber-500/5' : ''
                          }>
                          <TableCell>
                            <Checkbox checked={row.selected} disabled={row.status === 'success' || invalid}
                              onCheckedChange={c => updateRow(row.id, { selected: !!c })} />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-[120px]">
                              {row.imageUrls.map((u, i) => (
                                <div key={i} className="relative w-10 h-10 rounded border overflow-hidden group">
                                  <img src={u} alt="" className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
                                  <button onClick={() => removeRowImage(row.id, i)}
                                    className="absolute inset-0 bg-destructive/70 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                    <XIcon className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                              <button onClick={() => {
                                const u = prompt('Image URL:');
                                if (u) addRowImage(row.id, u);
                              }} className="w-10 h-10 rounded border border-dashed flex items-center justify-center hover:bg-muted">
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input value={row.name} onChange={e => updateRow(row.id, { name: e.target.value })} className="h-8" />
                            {row.description && (
                              <div className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{row.description}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input type="number" value={row.price} onChange={e => updateRow(row.id, { price: e.target.value })} className="h-8" />
                          </TableCell>
                          <TableCell>
                            <Input type="number" value={row.stock} onChange={e => updateRow(row.id, { stock: e.target.value })} className="h-8" />
                          </TableCell>
                          <TableCell>
                            <select className="h-8 w-full rounded-md border bg-background px-2 text-xs"
                              value={row.category} onChange={e => updateRow(row.id, { category: e.target.value })}>
                              <option value="">-- select --</option>
                              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                          </TableCell>
                          <TableCell>
                            {row.status === 'pending' && <span className="text-xs text-muted-foreground">{invalid ? 'incomplete' : 'ready'}</span>}
                            {row.status === 'importing' && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                            {row.status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                            {row.status === 'failed' && (
                              <span title={row.error} className="inline-flex items-center gap-1 text-xs text-destructive">
                                <AlertCircle className="h-3 w-3" /> failed
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <button onClick={() => removeRow(row.id)} className="p-1 hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
