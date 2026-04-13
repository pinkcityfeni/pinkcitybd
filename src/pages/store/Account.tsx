import { useAuth } from '@/data/auth';
import { useLanguage } from '@/data/language';
import { Package, ChevronDown, ChevronUp, CheckCircle2, Clock, XCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useOrders } from '@/hooks/useSupabaseData';

export default function Account() {
  const { data: allOrders = [] } = useOrders();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const orders = useMemo(() => allOrders.filter(o => o.type === 'online'), [allOrders]);
  const ORDER_STEPS = [
    { status: 'pending', label: t('account.orderReceived'), icon: Clock },
    { status: 'processing', label: t('account.processing'), icon: Package },
    { status: 'completed', label: t('account.delivered'), icon: CheckCircle2 },
  ];
  const handleLogout = () => { logout(); navigate('/'); };
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
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-xl border bg-card p-4 text-center"><p className="text-2xl font-bold" style={{ fontFamily: 'DM Sans, sans-serif' }}>{orders.length}</p><p className="text-xs text-muted-foreground">{t('account.orders')}</p></div>
        <div className="rounded-xl border bg-card p-4 text-center"><p className="text-2xl font-bold" style={{ fontFamily: 'DM Sans, sans-serif' }}>{orders.filter(o => o.status === 'completed').length}</p><p className="text-xs text-muted-foreground">{t('account.delivered')}</p></div>
      </div>
      <h2 className="font-semibold text-sm mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>{t('account.recentOrders')}</h2>
      <div className="space-y-2">
        {orders.map(o => {
          const expanded = expandedOrder === o.id;
          const stepIdx = getStepIndex(o.status);
          return (
            <div key={o.id} className="rounded-xl border bg-card overflow-hidden">
              <button className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors" onClick={() => setExpandedOrder(expanded ? null : o.id)}>
                <div><p className="font-mono text-xs text-muted-foreground">{o.id}</p><p className="text-[10px] text-muted-foreground">{new Date(o.date).toLocaleDateString('bn-BD')}</p></div>
                <div className="flex items-center gap-3">
                  <div className="text-right"><p className="font-bold text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>৳{o.total.toFixed(0)}</p><p className={`text-[10px] capitalize font-medium ${o.status === 'completed' ? 'text-success' : o.status === 'cancelled' ? 'text-destructive' : o.status === 'pending' ? 'text-warning' : 'text-info'}`}>{o.status}</p></div>
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
                      <div key={idx} className="flex justify-between text-sm"><span className="text-muted-foreground">{item.product.name} × {item.quantity}</span><span>৳{(item.product.price * item.quantity).toFixed(0)}</span></div>
                    ))}
                    {o.deliveryCharge !== undefined && o.deliveryCharge > 0 && (
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t('cart.deliveryCharge')}</span><span>৳{o.deliveryCharge}</span></div>
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
