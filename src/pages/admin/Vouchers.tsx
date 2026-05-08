import { useState } from 'react';
import {
  useVouchers,
  useCreateVoucher,
  useUpdateVoucher,
  useDeleteVoucher,
  useProducts,
  useCategories,
  type Voucher,
} from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Ticket, Power, PowerOff } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

function toLocalInput(iso: string) {
  // datetime-local needs YYYY-MM-DDTHH:MM
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

function fromLocalInput(local: string) {
  return new Date(local).toISOString();
}

function genCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function Vouchers() {
  const { data: vouchers = [] } = useVouchers();
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const createMut = useCreateVoucher();
  const updateMut = useUpdateVoucher();
  const deleteMut = useDeleteVoucher();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editVoucher, setEditVoucher] = useState<Voucher | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Voucher | null>(null);

  // form state
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [scopeType, setScopeType] = useState<'product' | 'category'>('product');
  const [scopeProductId, setScopeProductId] = useState('');
  const [scopeCategory, setScopeCategory] = useState('');
  const [startAt, setStartAt] = useState(toLocalInput(new Date().toISOString()));
  const [expireAt, setExpireAt] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return toLocalInput(d.toISOString());
  });
  const [perCustomerLimit, setPerCustomerLimit] = useState('1');
  const [minOrder, setMinOrder] = useState('0');
  const [active, setActive] = useState(true);

  const openNew = () => {
    setEditVoucher(null);
    setCode(genCode());
    setDiscount('');
    setScopeType('product');
    setScopeProductId(products[0]?.id || '');
    setScopeCategory(categories[0]?.name || '');
    setStartAt(toLocalInput(new Date().toISOString()));
    const d = new Date(); d.setDate(d.getDate() + 30);
    setExpireAt(toLocalInput(d.toISOString()));
    setPerCustomerLimit('1');
    setMinOrder('0');
    setActive(true);
    setDialogOpen(true);
  };

  const openEdit = (v: Voucher) => {
    setEditVoucher(v);
    setCode(v.code);
    setDiscount(String(v.discountAmount));
    setScopeType(v.scopeType);
    setScopeProductId(v.scopeProductId || '');
    setScopeCategory(v.scopeCategory || '');
    setStartAt(toLocalInput(v.startAt));
    setExpireAt(toLocalInput(v.expireAt));
    setPerCustomerLimit(String(v.perCustomerLimit));
    setMinOrder(String(v.minOrderAmount));
    setActive(v.active);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const c = code.trim().toUpperCase();
    const amt = parseFloat(discount) || 0;
    if (!c) return toast.error('Enter code');
    if (amt <= 0) return toast.error('Discount amount Day');
    if (scopeType === 'product' && !scopeProductId) return toast.error('Product select Do');
    if (scopeType === 'category' && !scopeCategory) return toast.error('Category select Do');
    if (new Date(expireAt) <= new Date(startAt)) return toast.error('Expire date start Must be after');

    const payload = {
      code: c,
      discountAmount: amt,
      scopeType,
      scopeProductId: scopeType === 'product' ? scopeProductId : null,
      scopeCategory: scopeType === 'category' ? scopeCategory : null,
      startAt: fromLocalInput(startAt),
      expireAt: fromLocalInput(expireAt),
      perCustomerLimit: Math.max(1, parseInt(perCustomerLimit) || 1),
      minOrderAmount: Math.max(0, parseFloat(minOrder) || 0),
      active,
    };

    try {
      if (editVoucher) {
        await updateMut.mutateAsync({ id: editVoucher.id, updates: payload });
        toast.success('Voucher update Has been');
      } else {
        await createMut.mutateAsync(payload);
        toast.success('Voucher Created');
      }
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e?.message || 'Save failed');
    }
  };

  const handleDelete = (v: Voucher) => {
    setDeleteTarget(v);
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      toast.success('Voucher delete Has been');
    } catch (e: any) {
      toast.error(e?.message || 'Delete failed');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleToggleActive = async (v: Voucher) => {
    await updateMut.mutateAsync({ id: v.id, updates: { active: !v.active } });
    toast.success(v.active ? 'Deactivated' : 'Activated');
  };

  const productName = (id?: string | null) => products.find(p => p.id === id)?.name || '—';
  const isExpired = (v: Voucher) => new Date(v.expireAt) < new Date();

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="h-6 w-6 text-primary" /> Vouchers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Product/Category specific discount codes manage Do</p>
        </div>
        <Button onClick={openNew} className="rounded-full">
          <Plus className="h-4 w-4 mr-1" /> New Voucher
        </Button>
      </div>

      {vouchers.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center">
          <Ticket className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">Still no voucher Not created</p>
          <Button onClick={openNew} variant="outline" className="mt-4 rounded-full">
            <Plus className="h-4 w-4 mr-1" /> First voucher Create
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {vouchers.map(v => {
            const expired = isExpired(v);
            return (
              <div key={v.id} className={`rounded-2xl border-2 bg-card p-4 transition-all ${v.active && !expired ? 'border-primary/20' : 'border-muted opacity-70'}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono font-bold text-base text-primary tracking-wider">{v.code}</span>
                      {!v.active && <Badge variant="secondary">Inactive</Badge>}
                      {expired && <Badge variant="destructive">Expired</Badge>}
                    </div>
                    <p className="text-2xl font-bold">Tk {v.discountAmount}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">
                      {v.scopeType === 'product' ? `Product: ${productName(v.scopeProductId)}` : `Category: ${v.scopeCategory}`}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => handleToggleActive(v)} className="p-1.5 rounded-md hover:bg-muted" title={v.active ? 'Deactivate' : 'Activate'}>
                      {v.active ? <Power className="h-3.5 w-3.5 text-success" /> : <PowerOff className="h-3.5 w-3.5 text-muted-foreground" />}
                    </button>
                    <button onClick={() => openEdit(v)} className="p-1.5 rounded-md hover:bg-muted" title="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(v)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive" title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground border-t pt-2">
                  <div>
                    <p className="opacity-60">Expires</p>
                    <p className="font-medium text-foreground">{new Date(v.expireAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="opacity-60">Per customer</p>
                    <p className="font-medium text-foreground">{v.perCustomerLimit}× use</p>
                  </div>
                  {v.minOrderAmount > 0 && (
                    <div className="col-span-2">
                      <p className="opacity-60">Min order</p>
                      <p className="font-medium text-foreground">Tk {v.minOrderAmount}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editVoucher ? 'Edit Voucher' : 'New Voucher'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Voucher Code</Label>
              <div className="flex gap-2 mt-1">
                <Input value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="font-mono uppercase tracking-wider" />
                <Button type="button" variant="outline" onClick={() => setCode(genCode())}>Random</Button>
              </div>
            </div>

            <div>
              <Label>Discount Amount (Tk )</Label>
              <Input type="number" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="50" className="mt-1" />
            </div>

            <div>
              <Label>Scope</Label>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setScopeType('product')}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${scopeType === 'product' ? 'border-primary bg-primary/5 text-primary' : 'border-muted'}`}
                >Product</button>
                <button
                  type="button"
                  onClick={() => setScopeType('category')}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${scopeType === 'category' ? 'border-primary bg-primary/5 text-primary' : 'border-muted'}`}
                >Category</button>
              </div>
            </div>

            {scopeType === 'product' ? (
              <div>
                <Label>Select Product</Label>
                <select
                  value={scopeProductId}
                  onChange={e => setScopeProductId(e.target.value)}
                  className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">— Choose —</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Tk {p.price})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <Label>Select Category</Label>
                <select
                  value={scopeCategory}
                  onChange={e => setScopeCategory(e.target.value)}
                  className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">— Choose —</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Start</Label>
                <Input type="datetime-local" value={startAt} onChange={e => setStartAt(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Expires</Label>
                <Input type="datetime-local" value={expireAt} onChange={e => setExpireAt(e.target.value)} className="mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Per-customer limit</Label>
                <Input type="number" min={1} value={perCustomerLimit} onChange={e => setPerCustomerLimit(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Min order Tk </Label>
                <Input type="number" min={0} value={minOrder} onChange={e => setMinOrder(e.target.value)} className="mt-1" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">If disabled customer apply Cannot do</p>
              </div>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>
                {editVoucher ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Voucher Delete??</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && <>Voucher <strong>{deleteTarget.code}</strong> will be deleted. This action cannot be undone.।</>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}