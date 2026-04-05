import { useStore } from '@/data/store';
import { DollarSign, Package, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const { products, orders } = useStore();
  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const lowStock = products.filter(p => p.stock < 20);
  const todayOrders = orders.filter(o => o.date.startsWith('2026-04-05'));
  const posOrders = orders.filter(o => o.type === 'pos');
  const onlineOrders = orders.filter(o => o.type === 'online');

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="page-header">Dashboard</h1>
      <p className="page-subheader mb-6">Overview of your shop performance</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: DollarSign, label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, color: 'text-success' },
          { icon: ShoppingCart, label: 'Total Orders', value: totalOrders, color: 'text-info' },
          { icon: Package, label: 'Products', value: totalProducts, color: 'text-primary' },
          { icon: TrendingUp, label: 'Today Orders', value: todayOrders.length, color: 'text-accent' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="stat-card">
          <h3 className="font-semibold mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {orders.slice(0, 5).map(o => (
              <div key={o.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-mono text-xs">{o.id}</p>
                  <p className="text-xs text-muted-foreground">{o.customerName || 'POS Sale'} · {o.type.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${o.total.toFixed(2)}</p>
                  <p className={`text-xs capitalize ${o.status === 'completed' ? 'text-success' : o.status === 'pending' ? 'text-warning' : 'text-info'}`}>{o.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock alert */}
        <div className="stat-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" /> Low Stock Items
          </h3>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground">All items well stocked 🎉</p>
          ) : (
            <div className="space-y-3">
              {lowStock.map(p => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span>{p.name}</span>
                  <span className="font-mono text-destructive">{p.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sales breakdown */}
        <div className="stat-card">
          <h3 className="font-semibold mb-4">Sales Channels</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold text-info">{onlineOrders.length}</p>
              <p className="text-sm text-muted-foreground">Online Orders</p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold text-primary">{posOrders.length}</p>
              <p className="text-sm text-muted-foreground">POS Sales</p>
            </div>
          </div>
        </div>

        {/* Profit overview */}
        <div className="stat-card">
          <h3 className="font-semibold mb-4">Profit Overview</h3>
          {orders.filter(o => o.status === 'completed').slice(0, 4).map(o => {
            const cost = o.items.reduce((s, i) => s + i.product.cost * i.quantity, 0);
            const profit = o.total - cost;
            return (
              <div key={o.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                <span className="font-mono text-xs text-muted-foreground">{o.id}</span>
                <div className="flex gap-4">
                  <span>Revenue: ${o.total.toFixed(2)}</span>
                  <span className="text-success font-medium">Profit: ${profit.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
