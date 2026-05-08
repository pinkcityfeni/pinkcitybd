import { forwardRef } from 'react';
import { useLanguage } from '@/data/language';
import type { Order, PaymentMethod } from '@/data/store';

interface POSInvoiceProps {
  order: Order;
}

const POSInvoice = forwardRef<HTMLDivElement, POSInvoiceProps>(({ order }, ref) => {
  const { t, locale } = useLanguage();
  const subtotal = order.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  const getMethodLabel = (m: PaymentMethod): string => {
    const map: Record<PaymentMethod, string> = {
      cash: t('pos.cash'), cod: t('pos.cash'), bkash: t('pos.bkash'),
      nagad: t('pos.nagad'), bank: t('pos.bank'),
    };
    return map[m] || m;
  };

  return (
    <div ref={ref} className="bg-white text-black p-6 max-w-[320px] mx-auto text-xs font-mono" style={{ minHeight: 400 }}>
      <div className="text-center border-b border-dashed border-gray-400 pb-3 mb-3">
        <h1 className="text-lg font-bold tracking-tight">{t('invoice.shopName')}</h1>
        <p className="text-[10px] text-gray-500 mt-0.5">{t('invoice.shopDesc')}</p>
        <p className="text-[10px] text-gray-500">{t('invoice.location')}</p>
        <p className="text-[10px] text-gray-500">📞 01715307271</p>
      </div>

      <div className="flex justify-between mb-3 text-[10px]">
        <div>
          <p><span className="text-gray-500">Invoice:</span> {order.id}</p>
          <p><span className="text-gray-500">{t('invoice.customer')}:</span> {order.customerName || t('invoice.walkIn')}</p>
        </div>
        <div className="text-right">
          <p>{new Date(order.date).toLocaleDateString(locale)}</p>
          <p>{new Date(order.date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      <table className="w-full mb-3">
        <thead>
          <tr className="border-b border-dashed border-gray-400">
            <th className="text-left py-1 text-[10px] font-semibold">{t('invoice.item')}</th>
            <th className="text-center py-1 text-[10px] font-semibold w-10">{t('invoice.qty')}</th>
            <th className="text-right py-1 text-[10px] font-semibold w-14">{t('invoice.price')}</th>
            <th className="text-right py-1 text-[10px] font-semibold w-16">{t('invoice.total')}</th>
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
              <td className="text-right py-1.5 text-[10px]">Tk {item.product.price.toFixed(0)}</td>
              <td className="text-right py-1.5 text-[10px] font-medium">Tk {(item.product.price * item.quantity).toFixed(0)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-dashed border-gray-400 pt-2 space-y-1">
        <div className="flex justify-between text-[10px]">
          <span className="text-gray-500">{t('invoice.subtotal')} ({t('invoice.nItems', { n: itemCount })})</span>
          <span>Tk {subtotal.toFixed(0)}</span>
        </div>
        {order.discount && order.discount > 0 ? (
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-500">{t('invoice.discount')} {order.discountType === 'percent' ? `(${order.discount}%)` : ''}</span>
            <span className="text-red-500">-Tk {order.discountType === 'percent' ? Math.round(subtotal * order.discount / 100) : order.discount}</span>
          </div>
        ) : null}
        {order.deliveryCharge ? (
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-500">{t('invoice.delivery')}</span>
            <span>Tk {order.deliveryCharge.toFixed(0)}</span>
          </div>
        ) : null}
        {order.pointsRedeemed && order.pointsRedeemed > 0 ? (
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-500">Points Redeemed ({order.pointsRedeemed})</span>
            <span className="text-red-500">-Tk {order.pointsRedeemed.toFixed(0)}</span>
          </div>
        ) : null}
        <div className="flex justify-between font-bold text-sm border-t border-dashed border-gray-400 pt-2 mt-1">
          <span>{t('invoice.grandTotal')}</span>
          <span>Tk {order.total.toFixed(0)}</span>
        </div>
        {order.pointsEarned && order.pointsEarned > 0 ? (
          <div className="flex justify-between text-[10px] pt-1">
            <span className="text-gray-500">Points Earned</span>
            <span className="font-semibold">+{order.pointsEarned} pts ⭐</span>
          </div>
        ) : null}
      </div>

      <div className="mt-3 pt-2 border-t border-dashed border-gray-400 text-center text-[10px] text-gray-500">
        {order.splitPayment ? (
          <div className="space-y-0.5 mb-1">
            <p className="font-semibold text-gray-700">{t('invoice.splitPayment')}</p>
            <p>{getMethodLabel(order.splitPayment.method1)}: Tk {order.splitPayment.amount1.toFixed(0)}</p>
            <p>{getMethodLabel(order.splitPayment.method2)}: Tk {order.splitPayment.amount2.toFixed(0)}</p>
          </div>
        ) : (
          <p>{t('invoice.paymentLabel')}: {getMethodLabel(order.paymentMethod || 'cash')}</p>
        )}
        <p className="mt-2">{t('invoice.thanks')}</p>
        <p className="mt-1 text-[8px] text-gray-400">{t('invoice.poweredBy')}</p>
      </div>
    </div>
  );
});

POSInvoice.displayName = 'POSInvoice';

export default POSInvoice;
