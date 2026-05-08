import { useAuth } from '@/data/auth';
import { useLanguage } from '@/data/language';
import { Package, ChevronDown, ChevronUp, CheckCircle2, Clock, XCircle, User, Sparkles, LayoutDashboard, ScanBarcode, MapPin, Pencil, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate, Link } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { useOrders, useMyPoints, useMyPointTransactions, useDeliveryAreas } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { BD_DISTRICTS_EN, BD_DISTRICTS_BN } from '@/data/bdDistricts';
import { toast } from 'sonner';

export default function Account() {
  const { data: allOrders = [] } = useOrders();
  const { user, logout } = useAuth();
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const orders = useMemo(() => allOrders.filter(o => o.type === 'online'), [allOrders]);
  const { data: myPoints } = useMyPoints(user?.id);
  const { data: pointTx = [] } = useMyPointTransactions(myPoints?.id);
  const { data: deliveryAreas = [] } = useDeliveryAreas();
  const activeAreas = deliveryAreas.filter(a => a.active);
  const [editAddr, setEditAddr] = useState(false);
  const [savingAddr, setSavingAddr] = useState(false);
  const [addrPhone, setAddrPhone] = useState('');
  const [addrAddress, setAddrAddress] = useState('');
  const [addrDistrict, setAddrDistrict] = useState('');
  const [addrArea, setAddrArea] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('phone, address, district, area')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setAddrPhone(data.phone || '');
        setAddrAddress(data.address || '');
        setAddrDistrict(data.district || '');
        setAddrArea(data.area || '');
      }
    })();
  }, [user?.id]);

  const saveAddress = async () => {
    if (!user?.id) return;
    setSavingAddr(true);
    const { error } = await supabase.from('profiles').update({
      phone: addrPhone,
      address: addrAddress,
      district: addrDistrict,
      area: addrDistrict === 'Feni' ? addrArea : '',
    }).eq('user_id', user.id);
    setSavingAddr(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Saved');
    setEditAddr(false);
  };
  const ORDER_STEPS = [
    { status: 'pending', label: t('account.orderReceived'), icon: Clock },
    { status: 'processing', label: t('account.processing'), icon: Package },
    { status: 'completed', label: t('account.delivered'), icon: CheckCircle2 },
  ];
  const handleLogout = async () => { await logout(); navigate('/'); };
  const getStepIndex = (status: string) => status === 'cancelled' ? -1 : ORDER_STEPS.findIndex(s => s.status === status);

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <h1 className="font-display text-2xl font-bold mb-5">{t('account.title')}</h1>
      <div className="rounded-xl border bg-card p-5 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center"><User className="h-6 w-6 text-primary" /></div>
          <div><p className="font-semibold text-sm">{user?.name || 'Guest'}</p><p className="text-xs text-muted-foreground">{user?.email}</p></div>
        </div>
        <Button variant="outline" size="sm" className="rounded-lg" onClick={handleLogout}>{t('account.logout')}</Button>
      </div>
      {(user?.role === 'admin' || user?.role === 'cashier') && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {user?.role === 'admin' && (
            <Link to="/admin" className="rounded-xl border bg-primary text-primary-foreground p-4 flex items-center gap-3 hover:opacity-90 transition-opacity">
              <LayoutDashboard className="h-5 w-5" />
              <span className="font-semibold text-sm">{t('account.adminDashboard')}</span>
            </Link>
          )}
          <Link to="/pos" className={`rounded-xl border p-4 flex items-center gap-3 hover:opacity-90 transition-opacity ${user?.role === 'admin' ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground col-span-2'}`}>
            <ScanBarcode className="h-5 w-5" />
            <span className="font-semibold text-sm">{t('account.adminPos')}</span>
          </Link>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-xl border bg-card p-4 text-center"><p className="text-2xl font-bold" style={{ fontFamily: 'DM Sans, sans-serif' }}>{orders.length}</p><p className="text-xs text-muted-foreground">{t('account.orders')}</p></div>
        <div className="rounded-xl border bg-card p-4 text-center"><p className="text-2xl font-bold" style={{ fontFamily: 'DM Sans, sans-serif' }}>{orders.filter(o => o.status === 'completed').length}</p><p className="text-xs text-muted-foreground">{t('account.delivered')}</p></div>
      </div>

      {/* My Points */}
      <div className="rounded-2xl border bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center"><Sparkles className="h-4 w-4 text-primary" /></div>
            <div>
              <p className="text-xs text-muted-foreground">{t('account.myPoints')}</p>
              <p className="text-2xl font-bold text-primary" style={{ fontFamily: 'DM Sans, sans-serif' }}>{myPoints?.points || 0}</p>
            </div>
          </div>
          <div className="text-right text-[10px] text-muted-foreground space-y-0.5">
            <p>{t('account.totalEarned')}: <span className="font-medium text-foreground">{myPoints?.total_earned || 0}</span></p>
            <p>{t('account.totalRedeemed')}: <span className="font-medium text-foreground">{myPoints?.total_redeemed || 0}</span></p>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">{t('account.pointsRule')}</p>
        {pointTx.length > 0 && (
          <details className="mt-3">
            <summary className="text-xs text-primary cursor-pointer">{t('account.recentTx')} ({pointTx.length})</summary>
            <div className="mt-2 space-y-1 max-h-40 overflow-auto">
              {pointTx.slice(0, 20).map((tx: any) => (
                <div key={tx.id} className="flex justify-between text-[11px] py-1 border-b border-border/40">
                  <span className="text-muted-foreground">{tx.note || tx.type} • {new Date(tx.created_at).toLocaleDateString(locale)}</span>
                  <span className={tx.points >= 0 ? 'text-success font-medium' : 'text-destructive font-medium'}>{tx.points >= 0 ? '+' : ''}{tx.points}</span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Saved delivery address */}
      <div className="rounded-2xl border bg-card p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {t('checkout.deliveryAddress')}</h3>
          {!editAddr ? (
            <Button size="sm" variant="ghost" onClick={() => setEditAddr(true)}><Pencil className="h-3.5 w-3.5 mr-1" />Edit</Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setEditAddr(false)}>Cancel</Button>
          )}
        </div>
        {!editAddr ? (
          <div className="text-sm text-muted-foreground space-y-1">
            {addrPhone && <p>📞 {addrPhone}</p>}
            {addrAddress ? (
              <p>{addrAddress}{addrArea ? ', ' + addrArea : ''}{addrDistrict ? ', ' + (locale === 'bn-BD' ? BD_DISTRICTS_BN[addrDistrict] || addrDistrict : addrDistrict) : ''}</p>
            ) : (
              <p className="text-xs italic">No saved delivery address yet.</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div><Label className="text-xs">{t('checkout.phone')}</Label><Input value={addrPhone} onChange={e => setAddrPhone(e.target.value)} placeholder="01XXXXXXXXX" /></div>
            <div><Label className="text-xs">{t('checkout.address')}</Label><Input value={addrAddress} onChange={e => setAddrAddress(e.target.value)} /></div>
            <div>
              <Label className="text-xs">{t('checkout.district')}</Label>
              <Select value={addrDistrict} onValueChange={(v) => { setAddrDistrict(v); if (v !== 'Feni') setAddrArea(''); }}>
                <SelectTrigger><SelectValue placeholder={t('checkout.selectDistrict')} /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {BD_DISTRICTS_EN.map(d => (
                    <SelectItem key={d} value={d}>{locale === 'bn-BD' ? BD_DISTRICTS_BN[d] : d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {addrDistrict === 'Feni' && (
              <div>
                <Label className="text-xs">{t('checkout.area')}</Label>
                <Select value={addrArea} onValueChange={setAddrArea}>
                  <SelectTrigger><SelectValue placeholder={t('checkout.selectArea')} /></SelectTrigger>
                  <SelectContent>
                    {activeAreas.map(a => (
                      <SelectItem key={a.id} value={a.name}>{a.name} — Tk {a.charge}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button size="sm" className="w-full" onClick={saveAddress} disabled={savingAddr}>
              <Save className="h-3.5 w-3.5 mr-1" />{savingAddr ? '...' : 'Save'}
            </Button>
          </div>
        )}
      </div>

      <h2 className="font-semibold text-sm mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>{t('account.recentOrders')}</h2>
      <div className="space-y-2">
        {orders.map(o => {
          const expanded = expandedOrder === o.id;
          const stepIdx = getStepIndex(o.status);
          return (
            <div key={o.id} className="rounded-xl border bg-card overflow-hidden">
              <button className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors" onClick={() => setExpandedOrder(expanded ? null : o.id)}>
                <div><p className="font-mono text-xs text-muted-foreground">{o.id}</p><p className="text-[10px] text-muted-foreground">{new Date(o.date).toLocaleDateString(locale)}</p></div>
                <div className="flex items-center gap-3">
                  <div className="text-right"><p className="font-bold text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>Tk {o.total.toFixed(0)}</p><p className={`text-[10px] capitalize font-medium ${o.status === 'completed' ? 'text-success' : o.status === 'cancelled' ? 'text-destructive' : o.status === 'pending' ? 'text-warning' : 'text-info'}`}>{o.status}</p></div>
                  {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>
              {expanded && (
                <div className="border-t p-4 space-y-4 animate-fade-in">
                  {o.status !== 'cancelled' ? (
                    <div className="flex items-center justify-between relative">
                      <div className="absolute top-4 left-6 right-6 h-0.5 bg-muted" />
                      <div className="absolute top-4 left-6 h-0.5 bg-primary transition-all" style={{ width: `${(stepIdx / (ORDER_STEPS.length - 1)) * 100}%`, maxWidth: 'calc(100% - 48px)' }} />
                      {ORDER_STEPS.map((step, idx) => {
                        const done = idx <= stepIdx;
                        return (
                          <div key={step.status} className="flex flex-col items-center z-10">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}><step.icon className="h-4 w-4" /></div>
                            <span className={`text-[10px] mt-1.5 ${done ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-destructive"><XCircle className="h-5 w-5" /><span className="text-sm font-medium">{t('account.orderCancelled')}</span></div>
                  )}
                  <div className="space-y-1 pt-2 border-t">
                    {o.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm"><span className="text-muted-foreground">{item.product.name} × {item.quantity}</span><span>Tk {(item.product.price * item.quantity).toFixed(0)}</span></div>
                    ))}
                    {o.deliveryCharge !== undefined && o.deliveryCharge > 0 && (
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t('cart.deliveryCharge')}</span><span>Tk {o.deliveryCharge}</span></div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {orders.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">{t('account.noOrders')}</p>}
      </div>
    </div>
  );
}
