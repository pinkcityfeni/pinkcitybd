import { useStore } from '@/data/store';
import { useAuth } from '@/data/auth';
import { Star, Package, Heart, ChevronDown, ChevronUp, CheckCircle2, Clock, Truck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { useMemo, useState } from 'react';

const ORDER_STEPS = [
  { status: 'pending', label: 'অর্ডার রিসিভ', icon: Clock },
  { status: 'processing', label: 'প্রসেসিং', icon: Package },
  { status: 'completed', label: 'ডেলিভারি সম্পন্ন', icon: CheckCircle2 },
];

export default function Account() {
  const allOrders = useStore(s => s.orders);
  const wishlist = useStore(s => s.wishlist);
  const products = useStore(s => s.products);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const orders = useMemo(() => allOrders.filter(o => o.type === 'online'), [allOrders]);
  const wishedProducts = useMemo(() => products.filter(p => wishlist.includes(p.id)), [products, wishlist]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStepIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    return ORDER_STEPS.findIndex(s => s.status === status);
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="page-header">আমার অ্যাকাউন্ট</h1>
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <div className="stat-card flex items-center gap-3">
          <Star className="h-8 w-8 text-accent" />
          <div>
            <p className="text-2xl font-bold">245</p>
            <p className="text-sm text-muted-foreground">রিওয়ার্ড পয়েন্ট</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" />
          <div>
            <p className="text-2xl font-bold">{orders.length}</p>
            <p className="text-sm text-muted-foreground">অর্ডার</p>
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{user?.name || 'Guest'}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>লগআউট</Button>
        </div>
      </div>

      {/* Wishlist */}
      {wishedProducts.length > 0 && (
        <>
          <h2 className="font-bold mt-8 mb-4 flex items-center gap-2"><Heart className="h-4 w-4 text-destructive" /> উইশলিস্ট ({wishedProducts.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {wishedProducts.map(p => (
              <Link key={p.id} to={`/product/${p.id}`} className="rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all">
                <div className="aspect-square bg-muted/30 flex items-center justify-center">
                  {p.image ? <img src={p.image} alt={p.name} className="h-full w-full object-cover" /> : <span className="text-3xl">💎</span>}
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium line-clamp-1">{p.name}</p>
                  <p className="text-sm font-bold text-primary">৳{p.price.toFixed(0)}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Orders with tracking */}
      <h2 className="font-bold mt-8 mb-4">সাম্প্রতিক অর্ডার</h2>
      <div className="space-y-3">
        {orders.map(o => {
          const expanded = expandedOrder === o.id;
          const stepIdx = getStepIndex(o.status);
          return (
            <div key={o.id} className="rounded-xl border bg-card overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedOrder(expanded ? null : o.id)}
              >
                <div>
                  <p className="font-mono text-sm">{o.id}</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.date).toLocaleDateString('bn-BD')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-primary">৳{o.total.toFixed(0)}</p>
                    <p className={`text-xs capitalize ${o.status === 'completed' ? 'text-success' : o.status === 'cancelled' ? 'text-destructive' : o.status === 'pending' ? 'text-warning' : 'text-info'}`}>{o.status}</p>
                  </div>
                  {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>

              {expanded && (
                <div className="border-t p-4 space-y-4 animate-fade-in">
                  {/* Order Tracking */}
                  {o.status !== 'cancelled' ? (
                    <div className="flex items-center justify-between relative">
                      <div className="absolute top-4 left-6 right-6 h-0.5 bg-muted" />
                      <div className="absolute top-4 left-6 h-0.5 bg-primary transition-all" style={{ width: `${(stepIdx / (ORDER_STEPS.length - 1)) * 100}%`, maxWidth: 'calc(100% - 48px)' }} />
                      {ORDER_STEPS.map((step, idx) => {
                        const done = idx <= stepIdx;
                        return (
                          <div key={step.status} className="flex flex-col items-center z-10">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                              <step.icon className="h-4 w-4" />
                            </div>
                            <span className={`text-[10px] mt-1.5 ${done ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-destructive">
                      <XCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">অর্ডার বাতিল হয়েছে</span>
                    </div>
                  )}

                  {/* Items */}
                  <div className="space-y-1 pt-2 border-t">
                    {o.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.product.name} × {item.quantity}</span>
                        <span>৳{(item.product.price * item.quantity).toFixed(0)}</span>
                      </div>
                    ))}
                    {o.deliveryCharge !== undefined && o.deliveryCharge > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">ডেলিভারি চার্জ</span>
                        <span>৳{o.deliveryCharge}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {orders.length === 0 && <p className="text-sm text-muted-foreground">এখনো কোনো অর্ডার নেই</p>}
      </div>
    </div>
  );
}
