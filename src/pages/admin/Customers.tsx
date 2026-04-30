import { useState, useMemo } from 'react';
import { useAllCustomerPoints, useAdjustPoints, type CustomerPoints } from '@/hooks/useSupabaseData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, Search, Plus, Minus, Phone } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';

function AdjustDialog({ customer }: { customer: CustomerPoints }) {
  const [open, setOpen] = useState(false);
  const [delta, setDelta] = useState('');
  const [note, setNote] = useState('');
  const adjust = useAdjustPoints();

  const handleSubmit = async () => {
    const d = parseInt(delta);
    if (!d) { toast.error('পরিবর্তনের পরিমাণ দিন'); return; }
    try {
      await adjust.mutateAsync({ customerId: customer.id, delta: d, note });
      toast.success(`${d > 0 ? '+' : ''}${d} পয়েন্ট আপডেট হয়েছে`);
      setOpen(false); setDelta(''); setNote('');
    } catch (e: any) {
      toast.error(e.message || 'Failed');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">পয়েন্ট সমন্বয়</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{customer.name || customer.phone} — পয়েন্ট সমন্বয়</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">বর্তমান: <span className="font-bold text-primary">{customer.points}</span></p>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setDelta(String(Math.abs(parseInt(delta) || 0)))}><Plus className="h-3 w-3 mr-1" />যোগ</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setDelta(String(-Math.abs(parseInt(delta) || 0)))}><Minus className="h-3 w-3 mr-1" />বাদ</Button>
          </div>
          <Input type="number" placeholder="পরিমাণ (e.g. 50 অথবা -50)" value={delta} onChange={e => setDelta(e.target.value)} />
          <Input placeholder="কারণ (optional)" value={note} onChange={e => setNote(e.target.value)} />
          <Button onClick={handleSubmit} disabled={adjust.isPending} className="w-full">
            {adjust.isPending ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Customers() {
  const { data: customers = [], isLoading } = useAllCustomerPoints();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(c =>
      c.phone.includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const totalPoints = customers.reduce((s, c) => s + (c.points || 0), 0);
  const totalEarned = customers.reduce((s, c) => s + (c.total_earned || 0), 0);
  const totalRedeemed = customers.reduce((s, c) => s + (c.total_redeemed || 0), 0);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">কাস্টমার পয়েন্ট</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">মোট কাস্টমার</p>
          <p className="text-2xl font-bold">{customers.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">বর্তমান পয়েন্ট</p>
          <p className="text-2xl font-bold text-primary">{totalPoints}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">মোট অর্জিত</p>
          <p className="text-2xl font-bold text-success">{totalEarned}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">মোট রিডিম</p>
          <p className="text-2xl font-bold text-destructive">{totalRedeemed}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border bg-card p-2">
        <Search className="h-4 w-4 text-muted-foreground ml-2" />
        <Input
          placeholder="ফোন / নাম দিয়ে খুঁজুন..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border-0 focus-visible:ring-0"
        />
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs">
              <tr>
                <th className="text-left p-3">নাম</th>
                <th className="text-left p-3">ফোন</th>
                <th className="text-right p-3">পয়েন্ট</th>
                <th className="text-right p-3 hidden md:table-cell">অর্জিত</th>
                <th className="text-right p-3 hidden md:table-cell">রিডিম</th>
                <th className="text-right p-3">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">লোড হচ্ছে...</td></tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">কোনো কাস্টমার পাওয়া যায়নি</td></tr>
              )}
              {filtered.map(c => (
                <tr key={c.id} className="border-t hover:bg-muted/20">
                  <td className="p-3 font-medium">{c.name || '—'}</td>
                  <td className="p-3 text-xs flex items-center gap-1"><Phone className="h-3 w-3 text-muted-foreground" />{c.phone}</td>
                  <td className="p-3 text-right font-bold text-primary">{c.points}</td>
                  <td className="p-3 text-right text-success hidden md:table-cell">{c.total_earned}</td>
                  <td className="p-3 text-right text-destructive hidden md:table-cell">{c.total_redeemed}</td>
                  <td className="p-3 text-right"><AdjustDialog customer={c} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}