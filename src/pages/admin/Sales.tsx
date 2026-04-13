import { useOrders } from '@/hooks/useSupabaseData';
import { useLanguage } from '@/data/language';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Sales() {
  const { data: orders = [] } = useOrders();
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
      return [o.id.slice(0, 8), new Date(o.date).toLocaleDateString(), o.type, o.total.toFixed(0), cost.toFixed(0), (o.total - cost).toFixed(0), o.paymentMethod || '', o.customerName || ''];
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

  const exportPDF = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString('en-GB');
    doc.setFontSize(20); doc.setFont('helvetica', 'bold'); doc.text('PINK CITY', 14, 20);
    doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(120);
    doc.text('Beauty & Cosmetics', 14, 26); doc.text(`Sales Report - ${today}`, 14, 32);
    doc.setDrawColor(220); doc.line(14, 35, 196, 35);
    doc.setTextColor(60); doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.text('Summary', 14, 44);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    const summaryData = [['Total Orders', `${completed.length}`], ['Total Revenue', `TK ${totalRevenue.toFixed(0)}`], ['Total Cost', `TK ${totalCost.toFixed(0)}`], ['Total Profit', `TK ${totalProfit.toFixed(0)}`], ['Profit Margin', `${margin.toFixed(1)}%`]];
    autoTable(doc, { startY: 48, head: [['Metric', 'Value']], body: summaryData, theme: 'grid', headStyles: { fillColor: [200, 50, 100], textColor: 255, fontStyle: 'bold', fontSize: 9 }, bodyStyles: { fontSize: 9 }, columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } }, margin: { left: 14, right: 14 }, tableWidth: 80 });
    const finalY = (doc as any).lastAutoTable?.finalY || 100;
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(60); doc.text('Completed Orders', 14, finalY + 12);
    if (completed.length > 0) {
      const orderRows = completed.map(o => { const cost = o.items.reduce((s, i) => s + i.product.buyingPrice * i.quantity, 0); return [o.id.slice(0, 8), new Date(o.date).toLocaleDateString('en-GB'), o.type.toUpperCase(), o.paymentMethod || 'N/A', o.customerName || 'Guest', `TK ${o.total.toFixed(0)}`, `TK ${cost.toFixed(0)}`, `TK ${(o.total - cost).toFixed(0)}`]; });
      autoTable(doc, { startY: finalY + 16, head: [['Order', 'Date', 'Channel', 'Payment', 'Customer', 'Revenue', 'Cost', 'Profit']], body: orderRows, theme: 'striped', headStyles: { fillColor: [200, 50, 100], textColor: 255, fontStyle: 'bold', fontSize: 8 }, bodyStyles: { fontSize: 8 }, columnStyles: { 5: { halign: 'right' }, 6: { halign: 'right' }, 7: { halign: 'right', textColor: [16, 120, 70] } }, margin: { left: 14, right: 14 } });
    } else { doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.text('No completed orders found.', 14, finalY + 20); }
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) { doc.setPage(i); doc.setFontSize(8); doc.setTextColor(160); doc.text(`PINK CITY - Sales Report | Generated: ${today} | Page ${i}/${pageCount}`, 14, 287); }
    doc.save(`pink-city-sales-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success('PDF downloaded!');
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="page-header">{t('sales.title')}</h1><p className="page-subheader">{t('sales.subtitle')}</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportPDF}><FileText className="h-4 w-4 mr-1" /> PDF</Button>
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" /> CSV</Button>
        </div>
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
            <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 font-medium">{t('sales.order')}</th><th className="pb-3 font-medium">{t('sales.date')}</th><th className="pb-3 font-medium">{t('sales.channel')}</th><th className="pb-3 font-medium text-right">{t('sales.revenue')}</th><th className="pb-3 font-medium text-right">{t('sales.cost')}</th><th className="pb-3 font-medium text-right">{t('sales.profit')}</th></tr></thead>
            <tbody>
              {completed.map(o => { const cost = o.items.reduce((s, i) => s + i.product.buyingPrice * i.quantity, 0); return (
                <tr key={o.id} className="border-b last:border-0"><td className="py-3 font-mono text-xs">{o.id.slice(0, 8)}</td><td className="py-3 text-xs">{new Date(o.date).toLocaleDateString()}</td><td className="py-3 text-xs uppercase">{o.type}</td><td className="py-3 text-right">৳{o.total.toFixed(0)}</td><td className="py-3 text-right text-muted-foreground">৳{cost.toFixed(0)}</td><td className="py-3 text-right text-success font-medium">৳{(o.total - cost).toFixed(0)}</td></tr>
              ); })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
