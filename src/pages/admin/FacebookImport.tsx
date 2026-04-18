import { useState } from 'react';
import { useCategories, useAddProduct, uploadImage } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Facebook, Plus, X as XIcon, Image as ImageIcon, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/data/store';

const EMPTY = {
  name: '',
  description: '',
  price: '',
  buyingPrice: '',
  stock: '10',
  barcode: '',
  category: '',
  subcategory: '',
  imageUrls: [] as string[],
};

export default function FacebookImport() {
  const { data: categories = [] } = useCategories();
  const addProductMut = useAddProduct();

  const [pastedText, setPastedText] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [importing, setImporting] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const selectedCat = categories.find(c => c.name === form.category);
  const subcategories = selectedCat?.subcategories || [];

  // Parse pasted Facebook post text → first line = name, rest = description
  const handleParseText = () => {
    if (!pastedText.trim()) {
      toast.error('আগে post-এর text paste করুন');
      return;
    }
    const lines = pastedText.split('\n').map(l => l.trim()).filter(Boolean);
    const name = lines[0]?.slice(0, 80) || '';
    const description = lines.slice(1).join('\n').trim() || lines[0] || '';

    // Try to detect price like "৳500", "500 tk", "Price: 500"
    const priceMatch = pastedText.match(/(?:৳|tk|টাকা|price[\s]+)\s*(\d{2,6})/i) || pastedText.match(/\b(\d{2,5})\s*(?:tk|টাকা|৳)/i);
    const price = priceMatch ? priceMatch[1] : '';

    setForm(f => ({ ...f, name, description, price: price || f.price }));
    toast.success('Text parse হয়েছে — নিচে check করে edit করুন');
  };

  const addImageUrl = () => {
    const url = imageInput.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      toast.error('Valid image URL দিন (https:// দিয়ে শুরু)');
      return;
    }
    setForm(f => ({ ...f, imageUrls: [...f.imageUrls, url] }));
    setImageInput('');
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

  // Download FB image → re-upload to our storage (FB URLs expire & block hotlinking)
  const persistFbImages = async (urls: string[]): Promise<string[]> => {
    const persisted: string[] = [];
    for (const url of urls) {
      try {
        // If already on our storage, keep as is
        if (url.includes('supabase.co/storage')) {
          persisted.push(url);
          continue;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error('fetch failed');
        const blob = await res.blob();
        const ext = blob.type.split('/')[1] || 'jpg';
        const file = new File([blob], `fb-${Date.now()}.${ext}`, { type: blob.type });
        const newUrl = await uploadImage(file);
        persisted.push(newUrl);
      } catch {
        // Fallback: keep original URL (may break later if FB expires it)
        toast.warning('একটা ছবি save করতে পারিনি — Facebook hotlink block করছে। ছবিটা download করে upload button দিয়ে দিন।');
        persisted.push(url);
      }
    }
    return persisted;
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
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        buyingPrice: Number(form.buyingPrice) || 0,
        barcode: form.barcode.trim(),
        category: form.category,
        subcategory: form.subcategory,
        stock: Number(form.stock) || 0,
        image: finalImages[0],
        images: finalImages,
        trending: false,
      };
      await addProductMut.mutateAsync(data);
      toast.success(`✅ "${form.name}" product হিসেবে add হয়েছে!`);
      setForm(EMPTY);
      setPastedText('');
    } catch (err: any) {
      toast.error('Import failed: ' + (err?.message || 'unknown error'));
    } finally {
      setImporting(false);
    }
  };

  const handleCategoryChange = (catName: string) => {
    const cat = categories.find(c => c.name === catName);
    setForm(f => ({ ...f, category: catName, subcategory: cat?.subcategories[0] || '' }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="page-header flex items-center gap-2">
          <Facebook className="h-6 w-6 text-[#1877F2]" />
          Facebook থেকে Product Import
        </h1>
        <p className="page-subheader">আপনার Facebook page-এর post থেকে copy-paste করে দ্রুত product বানান</p>
      </div>

      {/* How-to guide */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <button onClick={() => setShowGuide(s => !s)} className="flex items-center justify-between w-full text-left">
          <span className="font-semibold text-sm">📖 কিভাবে use করবেন? (step-by-step)</span>
          {showGuide ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showGuide && (
          <ol className="mt-3 space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Facebook-এ আপনার page-এর post-টা open করুন।</li>
            <li>Post-এর <strong>text/caption</strong> select করে copy করুন → নিচের "Post Text" box-এ paste করুন → <strong>"Auto-fill Form"</strong> button চাপুন।</li>
            <li>Post-এর <strong>ছবিতে right-click</strong> করুন → "Copy image address" / "ছবির URL কপি করুন" → নিচের image URL box-এ paste করে "Add" চাপুন। (একাধিক ছবি যোগ করতে পারবেন)</li>
            <li>অথবা ছবিটা download করে <strong>"Upload File"</strong> button দিয়ে upload করুন (recommended — কারণ FB ছবির URL কিছুদিন পর expire হয়ে যায়)।</li>
            <li>Price, stock, category check করে <strong>"Import as Product"</strong> চাপুন।</li>
          </ol>
        )}
      </Card>

      {/* Step 1: Paste post text */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
          <h2 className="font-semibold">Post-এর Text Paste করুন</h2>
        </div>
        <Textarea
          rows={5}
          placeholder={`এখানে Facebook post-এর caption/description paste করুন...\n\nউদাহরণ:\nGold Plated Necklace Set\nসুন্দর design, যেকোনো অনুষ্ঠানে পরার জন্য perfect\nPrice: 1500 tk`}
          value={pastedText}
          onChange={e => setPastedText(e.target.value)}
        />
        <Button onClick={handleParseText} variant="secondary" size="sm">
          ✨ Auto-fill Form (text থেকে)
        </Button>
      </Card>

      {/* Step 2: Images */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
          <h2 className="font-semibold">ছবি যোগ করুন</h2>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Facebook image URL paste করুন (https://...)"
            value={imageInput}
            onChange={e => setImageInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
          />
          <Button onClick={addImageUrl} type="button"><Plus className="h-4 w-4" /></Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>অথবা</span>
          <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-dashed cursor-pointer hover:bg-muted/50 transition-colors">
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Upload File</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
          </label>
          <span className="text-[10px]">(recommended — FB URL expire হয়ে যায়)</span>
        </div>

        {form.imageUrls.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {form.imageUrls.map((url, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border">
                <img src={url} alt={`img ${i + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
                <button onClick={() => removeImage(i)} className="absolute top-0.5 right-0.5 bg-background/80 rounded-full p-0.5 hover:bg-destructive hover:text-white">
                  <XIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Step 3: Product details */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
          <h2 className="font-semibold">Product Details</h2>
        </div>

        <div>
          <Label>Product Name *</Label>
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="যেমন: Gold Plated Necklace Set" />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Selling Price (৳) *</Label>
            <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
          </div>
          <div>
            <Label>Buying Price (৳)</Label>
            <Input type="number" value={form.buyingPrice} onChange={e => setForm(f => ({ ...f, buyingPrice: e.target.value }))} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Stock</Label>
            <Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
          </div>
          <div>
            <Label>Barcode (optional)</Label>
            <Input value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Category *</Label>
            <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.category} onChange={e => handleCategoryChange(e.target.value)}>
              <option value="">-- select --</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Subcategory</Label>
            <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.subcategory} onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}>
              <option value="">-- select --</option>
              {subcategories.map(sc => <option key={sc} value={sc}>{sc}</option>)}
            </select>
          </div>
        </div>

        <Button onClick={handleImport} disabled={importing} className="w-full mt-2" size="lg">
          {importing ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importing...</>
          ) : (
            <><Plus className="h-4 w-4 mr-2" /> Import as Product</>
          )}
        </Button>
      </Card>
    </div>
  );
}
