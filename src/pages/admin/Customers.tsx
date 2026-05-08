import { useState, useMemo } from 'react';
import { useAllCustomerPoints, useAdjustPoints, useCreateOrGrantCustomer, type CustomerPoints } from '@/hooks/useSupabaseData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, Search, Plus, Minus, Phone, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';

function GrantDialog() {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [points, setPoints] = useState('');
  const [note, setNote] = useState('');
  const grant = useCreateOrGrantCustomer();

  const handleSubmit = async () => {
    const p = parseInt(points);
    if (!phone.trim()) { toast.error('Enter phone number'); return; }
    if (!p || p <= 0) { toast.error('Enter points correctly'); return; }
    try {
      await grant.mutateAsync({ phone, name: name.trim(), points: p, note: note.trim() });
      toast.success(`${p} Points added`);
      setOpen(false); setPhone(''); setName(''); setPoints(''); setNote('');
    } catch (e: any) {
      toast.error(e.message || 'Failed');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><UserPlus className="h-4 w-4 mr-1.5" />Give points to customer</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Give points to any number.</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Phone Number *</label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Name (for new customer)</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Customer Name" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Points *</label>
            <Input type="number" min={1} value={points} onChange={e => setPoints(e.target.value)} placeholder="Such as: 100" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Reason (optional)</label>
            <Input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g.: First Visit Bonus" />
          </div>
          <p className="text-[11px] text-muted-foreground">If customer exists, points will be added; otherwise, a new account will be created.।</p>
          <Button onClick={handleSubmit} disabled={grant.isPending} className="w-full">
            {grant.isPending ? 'Saving...' : 'Give Points'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AdjustDialog({ customer }: { customer: CustomerPoints }) {
  const [open, setOpen] = useState(false);
  const [delta, setDelta] = useState('');
  const [note, setNote] = useState('');
  const adjust = useAdjustPoints();

  const handleSubmit = async () => {
    const d = parseInt(delta);
    if (!d) { toast.error('Enter change amount'); return; }
    try {
      await adjust.mutateAsync({ customerId: customer.id, delta: d, note });
      toast.success(`${d > 0 ? '+' : ''}${d} Points updated`);
      setOpen(false); setDelta(''); setNote('');
    } catch (e: any) {
      toast.error(e.message || 'Failed');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Point Adjustment</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{customer.name || customer.phone} — Point Adjustment</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Current: <span className="font-bold text-primary">{customer.points}</span></p>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setDelta(String(Math.abs(parseInt(delta) || 0)))}><Plus className="h-3 w-3 mr-1" />Add</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setDelta(String(-Math.abs(parseInt(delta) || 0)))}><Minus className="h-3 w-3 mr-1" />Remove</Button>
          </div>
          <Input type="number" placeholder="Amount (e.g. 50 Or -50)" value={delta} onChange={e => setDelta(e.target.value)} />
          <Input placeholder="Reason (optional)" value={note} onChange={e => setNote(e.target.value)} />
          <Button onClick={handleSubmit} disabled={adjust.isPending} className="w-full">
            {adjust.isPending ? 'Saving...' : 'Save'}
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
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">Customer Points</h1>
        </div>
        <GrantDialog />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Customers</p>
          <p className="text-2xl font-bold">{customers.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Current Points</p>
          <p className="text-2xl font-bold text-primary">{totalPoints}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Earned</p>
          <p className="text-2xl font-bold text-success">{totalEarned}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Redeem</p>
          <p className="text-2xl font-bold text-destructive">{totalRedeemed}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border bg-card p-2">
        <Search className="h-4 w-4 text-muted-foreground ml-2" />
        <Input
          placeholder="Phone / Search by Name..."
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
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Phone</th>
                <th className="text-right p-3">Points</th>
                <th className="text-right p-3 hidden md:table-cell">Earned</th>
                <th className="text-right p-3 hidden md:table-cell">Redeem</th>
                <th className="text-right p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Loading...</td></tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No customer found.</td></tr>
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