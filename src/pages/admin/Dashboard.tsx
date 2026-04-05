import { useMemo } from 'react';
import { useStore } from '@/data/store';
import {
  DollarSign, Package, ShoppingCart, TrendingUp, AlertTriangle,
  Monitor, ScanBarcode, ArrowUpRight, ArrowDownRight, BarChart3
} from 'lucide-react';

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

    // Monthly report — last 6 months
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

    return {
      todaySales, todayProfit, todayOrders, todayOnline, todayPos,
      allOnline, allPos, totalRevenue, totalProfit, lowStock, monthly,
    };
  }, [orders, products]);

  const maxRevenue = Math.max(...stats.monthly.map(m => m.revenue), 1);

  return (
    <div className="p-4 md:p-6 animate-fade-in space-y-6">
      <div>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Shop performance overview</p>
      </div>

      {/* ── Top Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={DollarSign}
          label="Today Sales"
          value={`$${stats.todaySales.toFixed(2)}`}
          sub={`${stats.todayOrders.length} orders`}
          color="text-primary"
          bgColor="bg-primary/10"
        />
        <StatCard
          icon={Monitor}
          label="Online Orders"
          value={stats.allOnline.length.toString()}
          sub={`${stats.todayOnline.length} today`}
          color="text-blue-500"
          bgColor="bg-blue-500/10"
        />
        <StatCard
          icon={ScanBarcode}
          label="POS Sales"
          value={stats.allPos.length.toString()}
          sub={`${stats.todayPos.length} today`}
          color="text-violet-500"
          bgColor="bg-violet-500/10"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Profit"
          value={`$${stats.totalProfit.toFixed(2)}`}
          sub={`Revenue: $${stats.totalRevenue.toFixed(2)}`}
          color="text-success"
          bgColor="bg-success/10"
        />
      </div>

      {/* ── Second Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Package}
          label="Total Products"
          value={products.length.toString()}
          sub={`${categories.length} categories`}
          color="text-accent"
          bgColor="bg-accent/10"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock"
          value={stats.lowStock.length.toString()}
          sub={stats.lowStock.length > 0 ? 'Needs restock' : 'All good'}
          color={stats.lowStock.length > 0 ? 'text-destructive' : 'text-success'}
          bgColor={stats.lowStock.length > 0 ? 'bg-destructive/10' : 'bg-success/10'}
        />
        <StatCard
          icon={ArrowUpRight}
          label="Today Profit"
          value={`$${stats.todayProfit.toFixed(2)}`}
          sub={`From ${stats.todayOrders.length} sales`}
          color="text-success"
          bgColor="bg-success/10"
        />
        <StatCard
          icon={ShoppingCart}
          label="Pending Orders"
          value={orders.filter(o => o.status === 'pending').length.toString()}
          sub="Awaiting processing"
          color="text-warning"
          bgColor="bg-warning/10"
        />
      </div>

      {/* ── Main Grid ── */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Monthly Report Chart */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Monthly Report
            </h3>
            <span className="text-xs text-muted-foreground">Last 6 months</span>
          </div>
          <div className="space-y-3">
            {stats.monthly.map(m => (
              <div key={m.month} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-14 shrink-0">{m.month}</span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden relative">
                    <div
                      className="h-full bg-primary/20 rounded-md transition-all"
                      style={{ width: `${(m.revenue / maxRevenue) * 100}%` }}
                    />
                    <div
                      className="h-full bg-success/40 rounded-md absolute top-0 left-0 transition-all"
                      style={{ width: `${(m.profit / maxRevenue) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0 w-28">
                  <span className="text-xs font-medium">${m.revenue.toFixed(0)}</span>
                  <span className="text-[10px] text-success ml-1.5">+${m.profit.toFixed(0)}</span>
                </div>
                <span className="text-[10px] text-muted-foreground w-12 text-right">{m.orders} ord</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 pt-3 border-t text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary/20" /> Revenue</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-success/40" /> Profit</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" /> Low Stock Items
          </h3>
          {stats.lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">All items well stocked ✓</p>
          ) : (
            <div className="space-y-2">
              {stats.lowStock.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.category} · {p.subcategory}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className={`text-xs font-bold ${p.stock <= 5 ? 'text-destructive' : 'text-warning'}`}>
                      {p.stock}
                    </span>
                    {p.stock <= 5 && <ArrowDownRight className="h-3 w-3 text-destructive" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom: Recent Orders + Category Breakdown ── */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-4">Recent Orders</h3>
          <div className="space-y-2">
            {orders.slice(0, 6).map(o => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">{o.id}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      o.type === 'pos' ? 'bg-violet-500/10 text-violet-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {o.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm mt-0.5">{o.customerName || 'Walk-in'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold">${o.total.toFixed(2)}</p>
                  <p className={`text-[10px] capitalize ${
                    o.status === 'completed' ? 'text-success' : o.status === 'pending' ? 'text-warning' : 'text-blue-500'
                  }`}>{o.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {categories.map(c => {
              const catProducts = products.filter(p => p.category === c.name);
              const catStock = catProducts.reduce((s, p) => s + p.stock, 0);
              const catValue = catProducts.reduce((s, p) => s + p.price * p.stock, 0);
              return (
                <div key={c.id} className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm flex items-center gap-1.5">
                      <span>{c.icon}</span> {c.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{catProducts.length} products</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{catStock} units in stock</span>
                    <span className="font-medium text-foreground">${catValue.toFixed(0)} value</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {c.subcategories.map(sc => (
                      <span key={sc} className="text-[10px] px-1.5 py-0.5 rounded bg-background border">
                        {sc} ({catProducts.filter(p => p.subcategory === sc).length})
                      </span>
                    ))}
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

// ── Stat Card Component ──
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
