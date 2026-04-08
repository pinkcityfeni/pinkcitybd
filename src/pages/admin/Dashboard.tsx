import { useMemo, useEffect, useState } from 'react';
import { useStore } from '@/data/store';
import { useLanguage } from '@/data/language';
import {
  Package, ShoppingCart, TrendingUp, AlertTriangle,
  Monitor, ScanBarcode, ArrowUpRight, ArrowDownRight, BarChart3, Crown
} from 'lucide-react';
import { toast } from 'sonner';
import { startOfDay, startOfWeek, startOfMonth, subDays } from 'date-fns';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

type DateFilter = 'today' | 'yesterday' | 'week' | 'month' | 'all';

const DATE_FILTERS: { value: DateFilter; label: string }[] = [
  { value: 'today', label: 'আজ' },
  { value: 'yesterday', label: 'গতকাল' },
  { value: 'week', label: 'এই সপ্তাহ' },
  { value: 'month', label: 'এই মাস' },
  { value: 'all', label: 'সর্বমোট' },
];

function getDateRange(filter: DateFilter): { start: Date; end: Date } {
  const now = new Date();
  const todayStart = startOfDay(now);
  switch (filter) {
    case 'today': return { start: todayStart, end: now };
    case 'yesterday': { const ys = subDays(todayStart, 1); return { start: ys, end: todayStart }; }
    case 'week': return { start: startOfWeek(now, { weekStartsOn: 6 }), end: now };
    case 'month': return { start: startOfMonth(now), end: now };
    case 'all': return { start: new Date(0), end: now };
  }
}

export default function Dashboard() {
  const products = useStore(s => s.products);
  const orders = useStore(s => s.orders);
  const categories = useStore(s => s.categories);
  const { t } = useLanguage();
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');

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

    // Top selling products
    const productSales: Record<string, { name: string; category: string; qty: number; revenue: number }> = {};
    orders.forEach(o => {
      o.items.forEach(i => {
        if (!productSales[i.product.id]) {
          productSales[i.product.id] = { name: i.product.name, category: i.product.category, qty: 0, revenue: 0 };
        }
        productSales[i.product.id].qty += i.quantity;
        productSales[i.product.id].revenue += i.product.price * i.quantity;
      });
    });
    const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 8);

    // Today's top products
    const todayProductSales: Record<string, { name: string; qty: number; revenue: number }> = {};
    todayOrders.forEach(o => {
      o.items.forEach(i => {
        if (!todayProductSales[i.product.id]) {
          todayProductSales[i.product.id] = { name: i.product.name, qty: 0, revenue: 0 };
        }
        todayProductSales[i.product.id].qty += i.quantity;
        todayProductSales[i.product.id].revenue += i.product.price * i.quantity;
      });
    });
    const todayTopProducts = Object.values(todayProductSales).sort((a, b) => b.qty - a.qty).slice(0, 5);

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
    return { todaySales, todayProfit, todayOrders, todayOnline, todayPos, allOnline, allPos, totalRevenue, totalProfit, lowStock, monthly, topProducts, todayTopProducts };
  }, [orders, products]);

  // Filtered stats based on selected date range
  const filtered = useMemo(() => {
    const { start, end } = getDateRange(dateFilter);
    const fOrders = orders.filter(o => {
      const d = new Date(o.date);
      return d >= start && d <= end;
    });
    const sales = fOrders.reduce((s, o) => s + o.total, 0);
    const cost = fOrders.reduce((s, o) => s + o.items.reduce((c, i) => c + i.product.buyingPrice * i.quantity, 0), 0);
    const profit = sales - cost;
    const online = fOrders.filter(o => o.type === 'online');
    const pos = fOrders.filter(o => o.type === 'pos');

    const productSales: Record<string, { name: string; category: string; qty: number; revenue: number }> = {};
    fOrders.forEach(o => {
      o.items.forEach(i => {
        if (!productSales[i.product.id]) {
          productSales[i.product.id] = { name: i.product.name, category: i.product.category, qty: 0, revenue: 0 };
        }
        productSales[i.product.id].qty += i.quantity;
        productSales[i.product.id].revenue += i.product.price * i.quantity;
      });
    });
    const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 8);

    return { sales, profit, cost, orders: fOrders, online, pos, topProducts };
  }, [orders, dateFilter]);

  useEffect(() => {
    const critical = stats.lowStock.filter(p => p.stock <= 5);
    if (critical.length > 0) {
      toast.warning(t('dash.lowStockAlert', { n: critical.length }), { duration: 5000 });
    }
  }, []);

  const maxRevenue = Math.max(...stats.monthly.map(m => m.revenue), 1);

  return (
    <div className="p-4 md:p-6 animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{t('dash.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('dash.subtitle')}</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border bg-card p-1">
          {DATE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setDateFilter(f.value)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                dateFilter === f.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtered Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={TrendingUp} label="বিক্রি" value={`৳${filtered.sales.toFixed(0)}`} sub={`${filtered.orders.length}টি অর্ডার`} color="text-primary" bgColor="bg-primary/10" />
        <StatCard icon={ArrowUpRight} label="লাভ" value={`৳${filtered.profit.toFixed(0)}`} sub={`খরচ: ৳${filtered.cost.toFixed(0)}`} color="text-success" bgColor="bg-success/10" />
        <StatCard icon={Monitor} label="অনলাইন অর্ডার" value={filtered.online.length.toString()} sub={`৳${filtered.online.reduce((s, o) => s + o.total, 0).toFixed(0)}`} color="text-blue-500" bgColor="bg-blue-500/10" />
        <StatCard icon={ScanBarcode} label="POS বিক্রি" value={filtered.pos.length.toString()} sub={`৳${filtered.pos.reduce((s, o) => s + o.total, 0).toFixed(0)}`} color="text-violet-500" bgColor="bg-violet-500/10" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Package} label={t('dash.totalProducts')} value={products.length.toString()} sub={t('dash.nCategories', { n: categories.length })} color="text-accent" bgColor="bg-accent/10" />
        <StatCard icon={AlertTriangle} label={t('dash.lowStock')} value={stats.lowStock.length.toString()} sub={stats.lowStock.length > 0 ? t('dash.needRestock') : t('dash.allGood')} color={stats.lowStock.length > 0 ? 'text-destructive' : 'text-success'} bgColor={stats.lowStock.length > 0 ? 'bg-destructive/10' : 'bg-success/10'} />
        <StatCard icon={ArrowUpRight} label={t('dash.todayProfit')} value={`৳${stats.todayProfit.toFixed(0)}`} sub={t('dash.fromSales', { n: stats.todayOrders.length })} color="text-success" bgColor="bg-success/10" />
        <StatCard icon={ShoppingCart} label={t('dash.pendingOrders')} value={orders.filter(o => o.status === 'pending').length.toString()} sub={t('dash.waitingProcess')} color="text-warning" bgColor="bg-warning/10" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> {t('dash.monthlyReport')}</h3>
            <span className="text-xs text-muted-foreground">{t('dash.last6Months')}</span>
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
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary/20" /> {t('dash.revenueLabel')}</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-success/40" /> {t('dash.profitLabel')}</span>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /> {t('dash.lowStockItems')}</h3>
          {stats.lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">{t('dash.allInStock')}</p>
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

      {/* Filtered Top Products + All Time Top */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Crown className="h-4 w-4 text-warning" /> টপ প্রোডাক্ট
            <span className="text-[10px] font-normal text-muted-foreground ml-1">({DATE_FILTERS.find(f => f.value === dateFilter)?.label})</span>
          </h3>
          {filtered.topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">কোনো বিক্রি নেই</p>
          ) : (
            <div className="space-y-2">
              {filtered.topProducts.slice(0, 5).map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${i === 0 ? 'bg-warning/20 text-warning' : 'bg-muted text-muted-foreground'}`}>{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.category}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-xs font-bold">৳{p.revenue.toFixed(0)}</span>
                    <span className="text-[10px] text-muted-foreground ml-1">({p.qty}টি)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> সর্বকালের টপ সেলিং</h3>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">কোনো বিক্রি নেই</p>
          ) : (
            <div className="space-y-2">
              {stats.topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${i === 0 ? 'bg-warning/20 text-warning' : 'bg-muted text-muted-foreground'}`}>{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.category}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-xs font-bold">৳{p.revenue.toFixed(0)}</span>
                    <span className="text-[10px] text-muted-foreground ml-1">({p.qty}টি)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-4">{t('dash.recentOrders')}</h3>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">{t('dash.noOrders')}</p>
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
          <h3 className="font-semibold mb-4">{t('dash.catBreakdown')}</h3>
          <div className="space-y-3">
            {categories.map(c => {
              const catProducts = products.filter(p => p.category === c.name);
              const catStock = catProducts.reduce((s, p) => s + p.stock, 0);
              const catValue = catProducts.reduce((s, p) => s + p.price * p.stock, 0);
              return (
                <div key={c.id} className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm flex items-center gap-1.5"><span>{c.icon}</span> {c.name}</span>
                    <span className="text-xs text-muted-foreground">{t('dash.nProducts', { n: catProducts.length })}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t('dash.unitsInStock', { n: catStock })}</span>
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
