import { useStore } from '@/data/store';

export default function Sales() {
  const { orders } = useStore();
  const completed = orders.filter(o => o.status === 'completed');
  const totalRevenue = completed.reduce((s, o) => s + o.total, 0);
  const totalCost = completed.reduce((s, o) => s + o.items.reduce((c, i) => c + i.product.cost * i.quantity, 0), 0);
  const totalProfit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="page-header">Sales</h1>
      <p className="page-subheader mb-6">Revenue and profit analysis</p>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="stat-card"><p className="text-sm text-muted-foreground">Revenue</p><p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p></div>
        <div className="stat-card"><p className="text-sm text-muted-foreground">Cost</p><p className="text-2xl font-bold text-muted-foreground">${totalCost.toFixed(2)}</p></div>
        <div className="stat-card"><p className="text-sm text-muted-foreground">Profit</p><p className="text-2xl font-bold text-success">${totalProfit.toFixed(2)}</p></div>
        <div className="stat-card"><p className="text-sm text-muted-foreground">Margin</p><p className="text-2xl font-bold text-primary">{margin.toFixed(1)}%</p></div>
      </div>

      <div className="stat-card">
        <h3 className="font-semibold mb-4">Completed Sales</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-3 font-medium">Order</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Channel</th>
              <th className="pb-3 font-medium text-right">Revenue</th>
              <th className="pb-3 font-medium text-right">Cost</th>
              <th className="pb-3 font-medium text-right">Profit</th>
            </tr>
          </thead>
          <tbody>
            {completed.map(o => {
              const cost = o.items.reduce((s, i) => s + i.product.cost * i.quantity, 0);
              return (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="py-3 font-mono text-xs">{o.id}</td>
                  <td className="py-3 text-xs">{new Date(o.date).toLocaleDateString()}</td>
                  <td className="py-3 text-xs uppercase">{o.type}</td>
                  <td className="py-3 text-right">${o.total.toFixed(2)}</td>
                  <td className="py-3 text-right text-muted-foreground">${cost.toFixed(2)}</td>
                  <td className="py-3 text-right text-success font-medium">${(o.total - cost).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
