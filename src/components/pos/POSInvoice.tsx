import { forwardRef } from 'react';
import type { Order, PaymentMethod } from '@/data/store';

interface POSInvoiceProps {
  order: Order;
}

const getMethodLabel = (m: PaymentMethod): string => {
  const map: Record<PaymentMethod, string> = {
    cash: 'নগদ',
    cod: 'নগদ',
    bkash: 'বিকাশ',
    nagad: 'নগদ (Nagad)',
    bank: 'ব্যাংক ট্রান্সফার',
    card: 'কার্ড',
  };
  return map[m] || m;
};

const POSInvoice = forwardRef<HTMLDivElement, POSInvoiceProps>(({ order }, ref) => {
  const subtotal = order.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div ref={ref} className="bg-white text-black p-6 max-w-[320px] mx-auto text-xs font-mono" style={{ minHeight: 400 }}>
      {/* Header */}
      <div className="text-center border-b border-dashed border-gray-400 pb-3 mb-3">
        <h1 className="text-lg font-bold tracking-tight">PINK CITY</h1>
        <p className="text-[10px] text-gray-500 mt-0.5">Jewelry & Cosmetics</p>
        <p className="text-[10px] text-gray-500">ফেনী, বাংলাদেশ</p>
        <p className="text-[10px] text-gray-500">📞 01XXXXXXXXX</p>
      </div>

      {/* Invoice Info */}
      <div className="flex justify-between mb-3 text-[10px]">
        <div>
          <p><span className="text-gray-500">Invoice:</span> {order.id}</p>
          <p><span className="text-gray-500">Customer:</span> {order.customerName || 'Walk-in'}</p>
        </div>
        <div className="text-right">
          <p>{new Date(order.date).toLocaleDateString('bn-BD')}</p>
          <p>{new Date(order.date).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-3">
        <thead>
          <tr className="border-b border-dashed border-gray-400">
            <th className="text-left py-1 text-[10px] font-semibold">আইটেম</th>
            <th className="text-center py-1 text-[10px] font-semibold w-10">পরি.</th>
            <th className="text-right py-1 text-[10px] font-semibold w-14">দাম</th>
            <th className="text-right py-1 text-[10px] font-semibold w-16">মোট</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, i) => (
            <tr key={i} className="border-b border-dotted border-gray-200">
              <td className="py-1.5 text-[10px] max-w-[140px]">
                <span className="block truncate">{item.product.name}</span>
                <span className="text-gray-400 text-[8px]">#{item.product.barcode}</span>
              </td>
              <td className="text-center py-1.5 text-[10px]">{item.quantity}</td>
              <td className="text-right py-1.5 text-[10px]">৳{item.product.price.toFixed(0)}</td>
              <td className="text-right py-1.5 text-[10px] font-medium">৳{(item.product.price * item.quantity).toFixed(0)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="border-t border-dashed border-gray-400 pt-2 space-y-1">
        <div className="flex justify-between text-[10px]">
          <span className="text-gray-500">সাবটোটাল ({itemCount}টি আইটেম)</span>
          <span>৳{subtotal.toFixed(0)}</span>
        </div>
        {order.deliveryCharge ? (
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-500">ডেলিভারি</span>
            <span>৳{order.deliveryCharge.toFixed(0)}</span>
          </div>
        ) : null}
        <div className="flex justify-between font-bold text-sm border-t border-dashed border-gray-400 pt-2 mt-1">
          <span>মোট</span>
          <span>৳{order.total.toFixed(0)}</span>
        </div>
      </div>

      {/* Payment */}
      <div className="mt-3 pt-2 border-t border-dashed border-gray-400 text-center text-[10px] text-gray-500">
        {order.splitPayment ? (
          <div className="space-y-0.5 mb-1">
            <p className="font-semibold text-gray-700">স্প্লিট পেমেন্ট</p>
            <p>{getMethodLabel(order.splitPayment.method1)}: ৳{order.splitPayment.amount1.toFixed(0)}</p>
            <p>{getMethodLabel(order.splitPayment.method2)}: ৳{order.splitPayment.amount2.toFixed(0)}</p>
          </div>
        ) : (
          <p>পেমেন্ট: {getMethodLabel(order.paymentMethod || 'cash')}</p>
        )}
        <p className="mt-2">ধন্যবাদ! আবার আসবেন 💕</p>
        <p className="mt-1 text-[8px] text-gray-400">Powered by PINK CITY POS</p>
      </div>
    </div>
  );
});

POSInvoice.displayName = 'POSInvoice';

export default POSInvoice;
