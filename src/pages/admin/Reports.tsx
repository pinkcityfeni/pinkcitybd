import { useStore } from '@/data/store';
import { BarChart3, TrendingUp, Package, ShoppingCart } from 'lucide-react';

export default function Reports() {
  const { products, orders } = useStore();
  const completed = orders.filter(o => o.status === 'completed');
  const totalRev = completed.reduce((s, o) => s + o.total, 0);

  // Top selling products
  const salesMap = new Map<string, { name: string; qty: number; revenue: number }>();
  completed.forEach(o => o.items.forEach(i => {
    const existing = salesMap.get(i.product.id) || { name: i.product.name, qty: 0, revenue: 0 };
    existing.qty += i.quantity;
    existing.revenue += i.product.price * i.quantity;
    salesMap.set(i.product.id, existing);
  }));
  const topProducts = [...salesMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // Category breakdown
  const catMap = new Map<string, number>();
  completed.forEach(o => o.items.forEach(i => {
    catMap.set(i.product.category, (catMap.get(i.product.category) || 0) + i.product.price * i.quantity);
  }));

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="page-header">Reports</h1>
      <p className="page-subheader mb-6">Business analytics and insights</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <h3 className="font-semibold flex items-center gap-2 mb-4"><TrendingUp className="h-4 w-4 text-primary" /> Top Products by Revenue</h3>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{p.name}</p>
                  <div className="h-2 rounded-full bg-muted mt-1 overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(p.revenue / (topProducts[0]?.revenue || 1)) * 100}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">${p.revenue.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{p.qty} sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="stat-card">
          <h3 className="font-semibold flex items-center gap-2 mb-4"><BarChart3 className="h-4 w-4 text-accent" /> Revenue by Category</h3>
          <div className="space-y-3">
            {[...catMap.entries()].sort((a, b) => b[1] - a[1]).map(([cat, rev]) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-sm">{cat}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${totalRev > 0 ? (rev / totalRev * 100) : 0}%` }} />
                  </div>
                  <span className="text-sm font-medium w-20 text-right">${rev.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="stat-card">
          <h3 className="font-semibold flex items-center gap-2 mb-4"><Package className="h-4 w-4 text-info" /> Inventory Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 rounded-lg bg-muted"><p className="text-2xl font-bold">{products.length}</p><p className="text-xs text-muted-foreground">Total Products</p></div>
            <div className="p-3 rounded-lg bg-muted"><p className="text-2xl font-bold">{products.reduce((s, p) => s + p.stock, 0)}</p><p className="text-xs text-muted-foreground">Total Units</p></div>
            <div className="p-3 rounded-lg bg-muted"><p className="text-2xl font-bold text-warning">{products.filter(p => p.stock < 20).length}</p><p className="text-xs text-muted-foreground">Low Stock</p></div>
            <div className="p-3 rounded-lg bg-muted"><p className="text-2xl font-bold">${products.reduce((s, p) => s + p.cost * p.stock, 0).toFixed(0)}</p><p className="text-xs text-muted-foreground">Inventory Value</p></div>
          </div>
        </div>

        <div className="stat-card">
          <h3 className="font-semibold flex items-center gap-2 mb-4"><ShoppingCart className="h-4 w-4 text-success" /> Order Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 rounded-lg bg-muted"><p className="text-2xl font-bold">{orders.length}</p><p className="text-xs text-muted-foreground">Total Orders</p></div>
            <div className="p-3 rounded-lg bg-muted"><p className="text-2xl font-bold text-success">{completed.length}</p><p className="text-xs text-muted-foreground">Completed</p></div>
            <div className="p-3 rounded-lg bg-muted"><p className="text-2xl font-bold">{orders.filter(o => o.type === 'online').length}</p><p className="text-xs text-muted-foreground">Online</p></div>
            <div className="p-3 rounded-lg bg-muted"><p className="text-2xl font-bold">{orders.filter(o => o.type === 'pos').length}</p><p className="text-xs text-muted-foreground">POS</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
