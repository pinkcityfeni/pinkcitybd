import { useMemo, useEffect } from 'react';
import { useStore } from '@/data/store';
import {
  Package, ShoppingCart, TrendingUp, AlertTriangle,
  Monitor, ScanBarcode, ArrowUpRight, ArrowDownRight, BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const { products, orders, categories } = useStore();

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter(o => o.date.slice(0, 10) === today);
    const todaySales = todayOrders.reduce((s, o) => s + o.total, 0);
    const todayCost = todayOrders.reduce((s, o) => s + o.items.reduce((c, i) => c + i.product.buyingPrice * i.quantity, 0), 0);
    const todayProfit = todaySales - todayCost;
    const todayOnline = todayOrders.filter(o => o.type === 'online');
    const todayPos = todayOrders.filter(o => o.type === 'pos');
    const allOnline = orders.filter(o => o.type === 'online');
    const allPos = orders.filter(o => o.type === 'pos');
    const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
    const totalCost = orders.reduce((s, o) => s + o.items.reduce((c, i) => c + i.product.buyingPrice * i.quantity, 0), 0);
    const totalProfit = totalRevenue - totalCost;
    const lowStock = products.filter(p => p.stock < 15).sort((a, b) => a.stock - b.stock);
    const monthly: { month: string; revenue: number; profit: number; orders: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const mo = orders.filter(o => o.date.slice(0, 7) === key);
      const rev = mo.reduce((s, o) => s + o.total, 0);
      const cost = mo.reduce((s, o) => s + o.items.reduce((c, i) => c + i.product.buyingPrice * i.quantity, 0), 0);
      monthly.push({ month: label, revenue: rev, profit: rev - cost, orders: mo.length });
    }
    return { todaySales, todayProfit, todayOrders, todayOnline, todayPos, allOnline, allPos, totalRevenue, totalProfit, lowStock, monthly };
  }, [orders, products]);

  // Low stock alerts on mount
  useEffect(() => {
    const critical = stats.lowStock.filter(p => p.stock <= 5);
    if (critical.length > 0) {
      toast.warning(`⚠️ ${critical.length}টি পণ্যের স্টক খুব কম!`, { duration: 5000 });
    }
  }, []);

  const maxRevenue = Math.max(...stats.monthly.map(m => m.revenue), 1);

  return (
    <div className="p-4 md:p-6 animate-fade-in space-y-6">
      <div>
        <h1 className="text-xl font-bold">ড্যাশবোর্ড</h1>
        <p className="text-sm text-muted-foreground">শপ পারফর্ম্যান্স ওভারভিউ</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={TrendingUp} label="আজকের বিক্রি" value={`৳${stats.todaySales.toFixed(0)}`} sub={`${stats.todayOrders.length}টি অর্ডার`} color="text-primary" bgColor="bg-primary/10" />
        <StatCard icon={Monitor} label="অনলাইন অর্ডার" value={stats.allOnline.length.toString()} sub={`আজ ${stats.todayOnline.length}টি`} color="text-blue-500" bgColor="bg-blue-500/10" />
        <StatCard icon={ScanBarcode} label="POS বিক্রি" value={stats.allPos.length.toString()} sub={`আজ ${stats.todayPos.length}টি`} color="text-violet-500" bgColor="bg-violet-500/10" />
        <StatCard icon={TrendingUp} label="মোট লাভ" value={`৳${stats.totalProfit.toFixed(0)}`} sub={`রেভিনিউ: ৳${stats.totalRevenue.toFixed(0)}`} color="text-success" bgColor="bg-success/10" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Package} label="মোট পণ্য" value={products.length.toString()} sub={`${categories.length}টি ক্যাটাগরি`} color="text-accent" bgColor="bg-accent/10" />
        <StatCard icon={AlertTriangle} label="লো স্টক" value={stats.lowStock.length.toString()} sub={stats.lowStock.length > 0 ? 'রিস্টক দরকার' : 'সব ঠিক আছে'} color={stats.lowStock.length > 0 ? 'text-destructive' : 'text-success'} bgColor={stats.lowStock.length > 0 ? 'bg-destructive/10' : 'bg-success/10'} />
        <StatCard icon={ArrowUpRight} label="আজকের লাভ" value={`৳${stats.todayProfit.toFixed(0)}`} sub={`${stats.todayOrders.length}টি বিক্রি থেকে`} color="text-success" bgColor="bg-success/10" />
        <StatCard icon={ShoppingCart} label="পেন্ডিং অর্ডার" value={orders.filter(o => o.status === 'pending').length.toString()} sub="প্রসেসিং এ অপেক্ষমাণ" color="text-warning" bgColor="bg-warning/10" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> মাসিক রিপোর্ট</h3>
            <span className="text-xs text-muted-foreground">শেষ ৬ মাস</span>
          </div>
          <div className="space-y-3">
            {stats.monthly.map(m => (
              <div key={m.month} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-14 shrink-0">{m.month}</span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden relative">
                    <div className="h-full bg-primary/20 rounded-md transition-all" style={{ width: `${(m.revenue / maxRevenue) * 100}%` }} />
                    <div className="h-full bg-success/40 rounded-md absolute top-0 left-0 transition-all" style={{ width: `${(m.profit / maxRevenue) * 100}%` }} />
                  </div>
                </div>
                <div className="text-right shrink-0 w-28">
                  <span className="text-xs font-medium">৳{m.revenue.toFixed(0)}</span>
                  <span className="text-[10px] text-success ml-1.5">+৳{m.profit.toFixed(0)}</span>
                </div>
                <span className="text-[10px] text-muted-foreground w-12 text-right">{m.orders} ord</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 pt-3 border-t text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary/20" /> রেভিনিউ</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-success/40" /> লাভ</span>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /> লো স্টক আইটেম</h3>
          {stats.lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">সব পণ্য স্টকে আছে ✓</p>
          ) : (
            <div className="space-y-2">
              {stats.lowStock.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.category} · {p.subcategory}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className={`text-xs font-bold ${p.stock <= 5 ? 'text-destructive' : 'text-warning'}`}>{p.stock}</span>
                    {p.stock <= 5 && <ArrowDownRight className="h-3 w-3 text-destructive" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-4">সাম্প্রতিক অর্ডার</h3>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">কোনো অর্ডার নেই</p>
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 6).map(o => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-muted-foreground">{o.id}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${o.type === 'pos' ? 'bg-violet-500/10 text-violet-500' : 'bg-blue-500/10 text-blue-500'}`}>{o.type.toUpperCase()}</span>
                    </div>
                    <p className="text-sm mt-0.5">{o.customerName || 'Walk-in'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">৳{o.total.toFixed(0)}</p>
                    <p className={`text-[10px] capitalize ${o.status === 'completed' ? 'text-success' : o.status === 'pending' ? 'text-warning' : 'text-blue-500'}`}>{o.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-4">ক্যাটাগরি ব্রেকডাউন</h3>
          <div className="space-y-3">
            {categories.map(c => {
              const catProducts = products.filter(p => p.category === c.name);
              const catStock = catProducts.reduce((s, p) => s + p.stock, 0);
              const catValue = catProducts.reduce((s, p) => s + p.price * p.stock, 0);
              return (
                <div key={c.id} className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm flex items-center gap-1.5"><span>{c.icon}</span> {c.name}</span>
                    <span className="text-xs text-muted-foreground">{catProducts.length}টি পণ্য</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{catStock} ইউনিট স্টকে</span>
                    <span className="font-medium text-foreground">৳{catValue.toFixed(0)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, bgColor }: {
  icon: React.ElementType; label: string; value: string; sub: string; color: string; bgColor: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className={`h-8 w-8 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}
