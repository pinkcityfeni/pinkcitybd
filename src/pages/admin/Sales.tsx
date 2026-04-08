import { useStore } from '@/data/store';
import { useLanguage } from '@/data/language';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export default function Sales() {
  const orders = useStore(s => s.orders);
  const { t } = useLanguage();
  const completed = orders.filter(o => o.status === 'completed');
  const totalRevenue = completed.reduce((s, o) => s + o.total, 0);
  const totalCost = completed.reduce((s, o) => s + o.items.reduce((c, i) => c + i.product.buyingPrice * i.quantity, 0), 0);
  const totalProfit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;

  const exportCSV = () => {
    const headers = ['Order ID', 'Date', 'Channel', 'Revenue', 'Cost', 'Profit', 'Payment', 'Customer'];
    const rows = completed.map(o => {
      const cost = o.items.reduce((s, i) => s + i.product.buyingPrice * i.quantity, 0);
      return [o.id, new Date(o.date).toLocaleDateString(), o.type, o.total.toFixed(0), cost.toFixed(0), (o.total - cost).toFixed(0), o.paymentMethod || '', o.customerName || ''];
    });
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('sales.downloading'));
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header">{t('sales.title')}</h1>
          <p className="page-subheader">{t('sales.subtitle')}</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-1" /> {t('sales.csvDownload')}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="stat-card"><p className="text-sm text-muted-foreground">{t('sales.revenue')}</p><p className="text-2xl font-bold">৳{totalRevenue.toFixed(0)}</p></div>
        <div className="stat-card"><p className="text-sm text-muted-foreground">{t('sales.cost')}</p><p className="text-2xl font-bold text-muted-foreground">৳{totalCost.toFixed(0)}</p></div>
        <div className="stat-card"><p className="text-sm text-muted-foreground">{t('sales.profit')}</p><p className="text-2xl font-bold text-success">৳{totalProfit.toFixed(0)}</p></div>
        <div className="stat-card"><p className="text-sm text-muted-foreground">{t('sales.margin')}</p><p className="text-2xl font-bold text-primary">{margin.toFixed(1)}%</p></div>
      </div>

      <div className="stat-card">
        <h3 className="font-semibold mb-4">{t('sales.completedSales')}</h3>
        {completed.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">{t('sales.noSales')}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 font-medium">{t('sales.order')}</th>
                <th className="pb-3 font-medium">{t('sales.date')}</th>
                <th className="pb-3 font-medium">{t('sales.channel')}</th>
                <th className="pb-3 font-medium text-right">{t('sales.revenue')}</th>
                <th className="pb-3 font-medium text-right">{t('sales.cost')}</th>
                <th className="pb-3 font-medium text-right">{t('sales.profit')}</th>
              </tr>
            </thead>
            <tbody>
              {completed.map(o => {
                const cost = o.items.reduce((s, i) => s + i.product.buyingPrice * i.quantity, 0);
                return (
                  <tr key={o.id} className="border-b last:border-0">
                    <td className="py-3 font-mono text-xs">{o.id}</td>
                    <td className="py-3 text-xs">{new Date(o.date).toLocaleDateString()}</td>
                    <td className="py-3 text-xs uppercase">{o.type}</td>
                    <td className="py-3 text-right">৳{o.total.toFixed(0)}</td>
                    <td className="py-3 text-right text-muted-foreground">৳{cost.toFixed(0)}</td>
                    <td className="py-3 text-right text-success font-medium">৳{(o.total - cost).toFixed(0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
