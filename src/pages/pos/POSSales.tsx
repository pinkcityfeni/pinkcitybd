import { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '@/data/store';
import { useProducts, useOrders, usePlaceOrder, useFindCustomerByPhone, type CustomerPoints } from '@/hooks/useSupabaseData';
import { useLanguage } from '@/data/language';
import type { Order, PaymentMethod, SplitPayment } from '@/data/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Search, CheckCircle2, ScanBarcode, Minus, Plus, ShoppingCart, Printer, RotateCcw, Split, Percent, Tag, Sparkles, UserCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import POSInvoice from '@/components/pos/POSInvoice';
import { dbToOrder } from '@/data/store';

export default function POSSales() {
  const { data: products = [] } = useProducts();
  const posCart = useStore(s => s.posCart);
  const addToPosCart = useStore(s => s.addToPosCart);
  const removeFromPosCart = useStore(s => s.removeFromPosCart);
  const updatePosCartQty = useStore(s => s.updatePosCartQty);
  const clearPosCart = useStore(s => s.clearPosCart);
  const placeOrderMut = usePlaceOrder();
  const findCustomerMut = useFindCustomerByPhone();
  const { t } = useLanguage();
  const [barcode, setBarcode] = useState('');
  const [search, setSearch] = useState('');
  const [saleComplete, setSaleComplete] = useState<{ order: Order; profit: number; pointsEarned: number; pointsRedeemed: number; customer: CustomerPoints | null } | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [showCart, setShowCart] = useState(false);
  const barcodeRef = useRef<HTMLInputElement>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [isSplit, setIsSplit] = useState(false);
  const [splitMethod1, setSplitMethod1] = useState<PaymentMethod>('cash');
  const [splitMethod2, setSplitMethod2] = useState<PaymentMethod>('bkash');
  const [splitAmount1, setSplitAmount1] = useState('');

  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [discountValue, setDiscountValue] = useState('');

  // Customer + points
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customer, setCustomer] = useState<CustomerPoints | null>(null);
  const [redeemPoints, setRedeemPoints] = useState('');

  const PAYMENT_METHODS: { value: PaymentMethod; label: string; color: string }[] = [
    { value: 'cash', label: t('pos.cash'), color: 'bg-green-600' },
    { value: 'bkash', label: t('pos.bkash'), color: 'bg-pink-600' },
    { value: 'nagad', label: t('pos.nagad'), color: 'bg-orange-600' },
    { value: 'bank', label: t('pos.bank'), color: 'bg-blue-600' },
  ];

  const focusBarcode = useCallback(() => {
    setTimeout(() => barcodeRef.current?.focus(), 50);
  }, []);

  useEffect(() => { focusBarcode(); }, [focusBarcode]);

  const subtotal = posCart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const totalCost = posCart.reduce((sum, i) => sum + i.product.buyingPrice * i.quantity, 0);
  const itemCount = posCart.reduce((sum, i) => sum + i.quantity, 0);

  const discountNum = parseFloat(discountValue) || 0;
  const discountAmount = discountType === 'percent' ? Math.round(subtotal * discountNum / 100) : discountNum;

  const availablePoints = customer?.points || 0;
  const canRedeem = !!customer && availablePoints >= 200;
  const redeemNum = parseInt(redeemPoints) || 0;
  const maxRedeem = Math.min(availablePoints, Math.max(0, subtotal - discountAmount));
  const effectiveRedeem = canRedeem ? Math.max(0, Math.min(redeemNum, maxRedeem)) : 0;

  const redeemError =
    redeemNum > 0 && !customer
      ? 'প্রথমে কাস্টমার খুঁজুন'
      : redeemNum > 0 && !canRedeem
      ? `রিডিম করতে কমপক্ষে ২০০ পয়েন্ট প্রয়োজন (বর্তমানে ${availablePoints})`
      : redeemNum > availablePoints
      ? `কাস্টমারের কাছে মাত্র ${availablePoints} পয়েন্ট আছে`
      : redeemNum > Math.max(0, subtotal - discountAmount)
      ? `সর্বোচ্চ ${Math.max(0, subtotal - discountAmount)} পয়েন্ট রিডিম করা যাবে`
      : '';

  const total = Math.max(0, subtotal - discountAmount - effectiveRedeem);
  const profit = total - totalCost;
  const willEarn = Math.floor(total / 100);

  const splitAmt1 = parseFloat(splitAmount1) || 0;
  const splitAmt2 = Math.max(0, total - splitAmt1);

  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    const code = barcode.trim();
    if (!code) return;
    const p = products.find(prod => prod.barcode === code);
    if (p) {
      if (p.stock <= 0) { toast.error(`${t('pos.outOfStock')}: ${p.name}`); }
      else {
        const inCart = posCart.find(i => i.product.id === p.id);
        if (inCart && inCart.quantity >= p.stock) { toast.error(`${t('pos.maxStock')}: ${p.name}`); }
        else { addToPosCart(p); toast.success(`✓ ${p.name}`, { duration: 1500 }); }
      }
    } else { toast.error(`${t('posBarcode.notFound')}: ${code}`); }
    setBarcode('');
    focusBarcode();
  };

  const handleCompleteSale = async () => {
    if (posCart.length === 0) return;
    if (redeemError) { toast.error(redeemError); return; }
    if (isSplit && splitAmt1 <= 0) { toast.error(t('pos.splitError1')); return; }
    if (isSplit && splitAmt1 >= total) { toast.error(t('pos.splitError2')); return; }

    const saleProfit = profit;
    const splitPayment: SplitPayment | undefined = isSplit ? {
      method1: splitMethod1, amount1: splitAmt1, method2: splitMethod2, amount2: splitAmt2,
    } : undefined;

    try {
      const result = await placeOrderMut.mutateAsync({
        type: 'pos',
        items: posCart,
        data: {
          paymentMethod: isSplit ? splitMethod1 : paymentMethod,
          paymentStatus: 'paid',
          splitPayment,
          discount: discountNum > 0 ? discountNum : undefined,
          discountType: discountNum > 0 ? discountType : undefined,
          customerName: customerName || undefined,
          customerPhone: customerPhone || undefined,
          redeemPoints: effectiveRedeem > 0 ? effectiveRedeem : undefined,
        },
      });

      const completedOrder: Order = {
        id: result.id,
        items: posCart,
        total: result.total,
        date: new Date().toISOString(),
        status: 'pending',
        type: 'pos',
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        paymentMethod: isSplit ? splitMethod1 : paymentMethod,
        paymentStatus: 'paid',
        splitPayment,
        discount: discountNum > 0 ? discountNum : undefined,
        discountType: discountNum > 0 ? discountType : undefined,
      };

      setSaleComplete({
        order: completedOrder,
        profit: saleProfit,
        pointsEarned: result.pointsEarned || 0,
        pointsRedeemed: result.pointsRedeemed || 0,
        customer,
      });
      clearPosCart();
      setPaymentMethod('cash'); setIsSplit(false); setSplitAmount1(''); setDiscountValue(''); setDiscountType('fixed');
      setCustomerPhone(''); setCustomerName(''); setCustomer(null); setRedeemPoints('');
    } catch (err: any) {
      toast.error(err.message || 'Order failed');
    }
  };

  const handleNewSale = () => { setSaleComplete(null); focusBarcode(); };

  const handleFindCustomer = async () => {
    if (!customerPhone.trim()) { toast.error('ফোন নাম্বার দিন'); return; }
    const found = await findCustomerMut.mutateAsync(customerPhone);
    if (found) {
      setCustomer(found);
      setCustomerName(found.name || '');
      toast.success(`${found.name || 'Customer'} — ${found.points} পয়েন্ট`);
    } else {
      setCustomer(null);
      toast.info('নতুন কাস্টমার — অর্ডার শেষে অ্যাকাউন্ট তৈরি হবে');
    }
  };

  const clearCustomer = () => {
    setCustomerPhone(''); setCustomerName(''); setCustomer(null); setRedeemPoints('');
  };

  const handlePrintInvoice = () => {
    if (!invoiceRef.current) return;
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) { toast.error(t('pos.popupBlocked')); return; }
    printWindow.document.write(`<html><head><title>Invoice - ${saleComplete?.order.id}</title><style>body{margin:0;font-family:monospace;}</style></head><body>${invoiceRef.current.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const filteredProducts = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search) || p.category.toLowerCase().includes(search.toLowerCase()))
    : products.slice(0, 12);

  const saleItemCount = saleComplete ? saleComplete.order.items.reduce((s, i) => s + i.quantity, 0) : 0;

  const getMethodLabel = (m: PaymentMethod) => PAYMENT_METHODS.find(pm => pm.value === m)?.label || m;

  if (saleComplete) return (
    <div className="flex-1 flex flex-col md:flex-row overflow-auto">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center animate-fade-in">
          <CheckCircle2 className="h-20 w-20 mx-auto mb-4 text-success" />
          <h2 className="text-2xl font-bold mb-2">{t('pos.saleComplete')}</h2>
          <p className="text-sm opacity-70 mb-1">Order: {saleComplete.order.id.slice(0, 8)}</p>
          <p className="text-sm opacity-70 mb-1">{t('pos.nItemsSold', { n: saleItemCount })}</p>
          <p className="text-3xl font-bold text-primary my-3">৳{saleComplete.order.total.toFixed(0)}</p>
          <p className="text-sm text-success font-medium mb-2">{t('pos.profitLabel')}: ৳{saleComplete.profit.toFixed(0)}</p>
          {(saleComplete.pointsEarned > 0 || saleComplete.pointsRedeemed > 0) && (
            <div className="mb-3 p-2.5 rounded-lg bg-primary/10 border border-primary/20 inline-block text-xs space-y-0.5">
              {saleComplete.pointsRedeemed > 0 && <p>রিডিম: <span className="font-bold">{saleComplete.pointsRedeemed} পয়েন্ট</span></p>}
              {saleComplete.pointsEarned > 0 && <p>অর্জিত: <span className="font-bold text-primary">+{saleComplete.pointsEarned} পয়েন্ট</span></p>}
            </div>
          )}
          {saleComplete.order.splitPayment ? (
            <div className="text-xs opacity-70 mb-4 space-y-0.5">
              <p>{getMethodLabel(saleComplete.order.splitPayment.method1)}: ৳{saleComplete.order.splitPayment.amount1.toFixed(0)}</p>
              <p>{getMethodLabel(saleComplete.order.splitPayment.method2)}: ৳{saleComplete.order.splitPayment.amount2.toFixed(0)}</p>
            </div>
          ) : (
            <p className="text-xs opacity-70 mb-4">{t('pos.payment')}: {getMethodLabel(saleComplete.order.paymentMethod || 'cash')}</p>
          )}
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handlePrintInvoice}>
              <Printer className="h-4 w-4 mr-2" /> {t('pos.printInvoice')}
            </Button>
            <Button size="lg" onClick={handleNewSale}>
              <RotateCcw className="h-4 w-4 mr-2" /> {t('pos.newSale')}
            </Button>
          </div>
        </div>
      </div>

      <div className="md:w-96 border-l p-4 overflow-auto" style={{ borderColor: 'hsl(var(--pos-border))' }}>
        <h3 className="text-sm font-semibold mb-3 text-center opacity-60">{t('pos.invoicePreview')}</h3>
        <div className="rounded-xl overflow-hidden shadow-lg">
          <POSInvoice ref={invoiceRef} order={saleComplete.order} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
      <button className="md:hidden fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground rounded-full h-14 w-14 flex items-center justify-center shadow-lg" onClick={() => setShowCart(!showCart)}>
        <ShoppingCart className="h-6 w-6" />
        {itemCount > 0 && <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{itemCount}</span>}
      </button>

      <div className={`flex-1 p-4 space-y-3 overflow-auto ${showCart ? 'hidden md:block' : ''}`}>
        <form onSubmit={handleBarcodeScan}>
          <div className="pos-panel flex gap-2 items-center">
            <ScanBarcode className="h-5 w-5 text-primary shrink-0" />
            <Input ref={barcodeRef} value={barcode} onChange={e => setBarcode(e.target.value)} placeholder={t('pos.scanBarcode')} className="bg-transparent border-pos-border font-mono text-lg" autoFocus />
            <Button type="submit" size="sm">{t('pos.addBtn')}</Button>
          </div>
        </form>

        <div className="pos-panel">
          <div className="flex items-center gap-2 mb-3">
            <Search className="h-4 w-4 opacity-50" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('pos.searchPlaceholder')} className="bg-transparent border-pos-border" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {filteredProducts.map(p => (
              <button key={p.id} onClick={() => { if (p.stock <= 0) { toast.error(t('pos.outOfStock')); return; } addToPosCart(p); toast.success(`✓ ${p.name}`, { duration: 1500 }); focusBarcode(); }} className="p-3 rounded-lg text-left transition-all hover:bg-primary/10 hover:scale-[1.02] disabled:opacity-40" style={{ background: 'hsl(var(--pos-bg))' }} disabled={p.stock === 0}>
                <p className="text-xs truncate font-medium">{p.name}</p>
                <p className="text-sm font-bold text-primary mt-1">৳{p.price.toFixed(0)}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] font-mono opacity-50">#{p.barcode}</span>
                  <span className={`text-[10px] font-medium ${p.stock < 10 ? 'text-destructive' : 'text-success'}`}>{t('pos.left', { n: p.stock })}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`${showCart ? 'fixed inset-0 z-40 flex flex-col' : 'hidden'} md:relative md:flex md:w-80 lg:w-96 border-l md:flex-col`} style={{ borderColor: 'hsl(var(--pos-border))', background: 'hsl(var(--pos-card))' }}>
        <div className="p-4 border-b font-semibold text-sm flex items-center justify-between" style={{ borderColor: 'hsl(var(--pos-border))' }}>
          <div className="flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-primary" /> {t('pos.cart')} ({t('pos.items', { n: itemCount })})</div>
          <button className="md:hidden text-xs opacity-60" onClick={() => setShowCart(false)}>{t('pos.close')}</button>
        </div>

        <div className="flex-1 overflow-auto p-3 space-y-1">
          {posCart.map(item => (
            <div key={item.product.id} className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: 'hsl(var(--pos-bg))' }}>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{item.product.name}</p>
                <p className="text-[10px] opacity-50">#{item.product.barcode} · {t('pos.each', { price: item.product.price.toFixed(0) })}</p>
              </div>
              <div className="flex items-center gap-0.5">
                <button className="h-6 w-6 rounded flex items-center justify-center hover:bg-primary/20 transition-colors" onClick={() => { if (item.quantity <= 1) removeFromPosCart(item.product.id); else updatePosCartQty(item.product.id, item.quantity - 1); }}>
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button className="h-6 w-6 rounded flex items-center justify-center hover:bg-primary/20 transition-colors" onClick={() => { if (item.quantity >= item.product.stock) { toast.error(t('pos.maxStock')); return; } updatePosCartQty(item.product.id, item.quantity + 1); }}>
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <span className="text-xs font-bold w-16 text-right">৳{(item.product.price * item.quantity).toFixed(0)}</span>
              <button onClick={() => removeFromPosCart(item.product.id)} className="text-destructive/70 hover:text-destructive ml-1"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
          {posCart.length === 0 && (
            <div className="text-center py-16 opacity-40">
              <ScanBarcode className="h-10 w-10 mx-auto mb-2" />
              <p className="text-sm">{t('pos.scanToStart')}</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t space-y-2" style={{ borderColor: 'hsl(var(--pos-border))' }}>
          {/* Customer / Points */}
          <div className="rounded-lg p-2 space-y-1.5" style={{ background: 'hsl(var(--pos-bg))' }}>
            <div className="flex items-center gap-1.5">
              <UserCircle className="h-3.5 w-3.5 text-primary shrink-0" />
              <Input
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="ফোন নাম্বার"
                className="h-7 text-xs bg-transparent border-pos-border flex-1"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleFindCustomer(); } }}
              />
              {customer ? (
                <button onClick={clearCustomer} className="p-1 rounded hover:bg-destructive/20 text-destructive"><X className="h-3 w-3" /></button>
              ) : (
                <Button type="button" size="sm" variant="outline" className="h-7 text-[10px] px-2" onClick={handleFindCustomer} disabled={findCustomerMut.isPending}>
                  {findCustomerMut.isPending ? '...' : 'খুঁজুন'}
                </Button>
              )}
            </div>
            {customer ? (
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium truncate">{customer.name || 'Customer'}</span>
                <span className="text-primary font-bold flex items-center gap-1"><Sparkles className="h-3 w-3" />{customer.points}</span>
              </div>
            ) : customerPhone && (
              <Input
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="নতুন কাস্টমার নাম (optional)"
                className="h-7 text-xs bg-transparent border-pos-border"
              />
            )}
            {canRedeem && (
              <div className="flex items-center gap-1.5 pt-1">
                <Sparkles className="h-3 w-3 text-primary" />
                <Input
                  type="number"
                  value={redeemPoints}
                  onChange={e => setRedeemPoints(e.target.value)}
                  placeholder={`রিডিম (max ${maxRedeem})`}
                  className="h-7 text-[11px] bg-transparent border-pos-border flex-1"
                />
                <button type="button" onClick={() => setRedeemPoints(String(maxRedeem))} className="text-[10px] text-primary px-1.5">Max</button>
              </div>
            )}
            {redeemError && <p className="text-[10px] text-destructive font-medium">{redeemError}</p>}
          </div>

          <div className="flex justify-between text-xs opacity-70"><span>{t('pos.subtotal')} ({t('pos.items', { n: itemCount })})</span><span>৳{subtotal.toFixed(0)}</span></div>

          <div className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-primary shrink-0" />
            <div className="flex rounded-lg overflow-hidden flex-1" style={{ background: 'hsl(var(--pos-bg))' }}>
              <button onClick={() => setDiscountType('fixed')} className={`text-[10px] px-2 py-1 font-medium transition-colors ${discountType === 'fixed' ? 'bg-primary text-primary-foreground' : 'opacity-50'}`}>৳</button>
              <button onClick={() => setDiscountType('percent')} className={`text-[10px] px-2 py-1 font-medium transition-colors ${discountType === 'percent' ? 'bg-primary text-primary-foreground' : 'opacity-50'}`}><Percent className="h-3 w-3" /></button>
              <Input type="number" placeholder={discountType === 'fixed' ? t('pos.discountFixed') : t('pos.discountPercent')} value={discountValue} onChange={e => setDiscountValue(e.target.value)} className="h-7 text-xs bg-transparent border-0 focus-visible:ring-0 flex-1" />
            </div>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-xs font-medium text-destructive">
              <span>{t('pos.discount')} {discountType === 'percent' ? `(${discountNum}%)` : ''}</span>
              <span>-৳{discountAmount.toFixed(0)}</span>
            </div>
          )}
          {effectiveRedeem > 0 && (
            <div className="flex justify-between text-xs font-medium text-primary">
              <span>পয়েন্ট রিডিম ({effectiveRedeem})</span>
              <span>-৳{effectiveRedeem.toFixed(0)}</span>
            </div>
          )}

          <div className="flex justify-between text-xs opacity-70"><span>{t('pos.costLabel')}</span><span>৳{totalCost.toFixed(0)}</span></div>
          <div className="flex justify-between text-xs font-medium text-success"><span>{t('pos.profitLabel')}</span><span>৳{profit.toFixed(0)}</span></div>
          <div className="flex justify-between font-bold text-lg border-t pt-2" style={{ borderColor: 'hsl(var(--pos-border))' }}>
            <span>{t('pos.total')}</span><span className="text-primary">৳{total.toFixed(0)}</span>
          </div>
          {willEarn > 0 && customerPhone && (
            <p className="text-[10px] text-success flex items-center gap-1"><Sparkles className="h-2.5 w-2.5" /> এই অর্ডারে +{willEarn} পয়েন্ট যোগ হবে</p>
          )}

          <div className="border-t pt-2 space-y-2" style={{ borderColor: 'hsl(var(--pos-border))' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium opacity-70">{t('pos.paymentMethod')}</span>
              <button onClick={() => setIsSplit(!isSplit)} className={`text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors ${isSplit ? 'bg-primary text-primary-foreground' : 'opacity-60 hover:opacity-100'}`}>
                <Split className="h-3 w-3" /> {t('pos.split')}
              </button>
            </div>

            {!isSplit ? (
              <div className="grid grid-cols-2 gap-1.5">
                {PAYMENT_METHODS.map(pm => (
                  <button key={pm.value} onClick={() => setPaymentMethod(pm.value)} className={`text-[11px] py-1.5 px-2 rounded-lg font-medium transition-all ${paymentMethod === pm.value ? `${pm.color} text-white scale-[1.02]` : 'opacity-50 hover:opacity-80'}`} style={paymentMethod !== pm.value ? { background: 'hsl(var(--pos-bg))' } : {}}>
                    {pm.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2 rounded-lg p-2" style={{ background: 'hsl(var(--pos-bg))' }}>
                <div>
                  <p className="text-[10px] opacity-50 mb-1">{t('pos.firstPayment')}</p>
                  <div className="flex gap-1">
                    {PAYMENT_METHODS.map(pm => (
                      <button key={pm.value} onClick={() => setSplitMethod1(pm.value)} className={`text-[10px] py-1 px-1.5 rounded font-medium transition-all flex-1 ${splitMethod1 === pm.value ? `${pm.color} text-white` : 'opacity-40 hover:opacity-70'}`} style={splitMethod1 !== pm.value ? { background: 'hsl(var(--pos-card))' } : {}}>
                        {pm.label}
                      </button>
                    ))}
                  </div>
                  <Input type="number" placeholder={t('pos.amountPlaceholder')} value={splitAmount1} onChange={e => setSplitAmount1(e.target.value)} className="mt-1 h-8 text-xs bg-transparent border-pos-border" />
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] opacity-50 mb-1">{t('pos.secondPayment')}</p>
                    <p className="text-[10px] font-medium text-primary">৳{splitAmt2.toFixed(0)}</p>
                  </div>
                  <div className="flex gap-1">
                    {PAYMENT_METHODS.map(pm => (
                      <button key={pm.value} onClick={() => setSplitMethod2(pm.value)} className={`text-[10px] py-1 px-1.5 rounded font-medium transition-all flex-1 ${splitMethod2 === pm.value ? `${pm.color} text-white` : 'opacity-40 hover:opacity-70'}`} style={splitMethod2 !== pm.value ? { background: 'hsl(var(--pos-card))' } : {}}>
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button className="w-full" size="lg" disabled={posCart.length === 0 || !!redeemError} onClick={handleCompleteSale}>
            {t('pos.completeSale')} — ৳{total.toFixed(0)}
          </Button>
        </div>
      </div>
    </div>
  );
}
