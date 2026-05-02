import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '@/data/store';
import { usePlaceOrder, useMyPoints } from '@/hooks/useSupabaseData';
import { useAuth } from '@/data/auth';
import { useLanguage } from '@/data/language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle2, ShoppingBag, ArrowLeft, MapPin, Phone, Mail, User, Package, Gift, Wallet, Building2, Banknote, Smartphone, Copy, Check, Truck, Sparkles, Ticket } from 'lucide-react';
import VoucherInput from '@/components/VoucherInput';
import type { PaymentMethod, DeliveryZone, Order } from '@/data/store';

type Step = 'details' | 'review' | 'done';

const DELIVERY_CHARGES: Record<DeliveryZone, number> = {
  feni: 30,
  feni_upozila: 70,
  outside: 150,
};

export default function Checkout() {
  const cart = useStore(s => s.cart);
  const clearCart = useStore(s => s.clearCart);
  const placeOrderMut = usePlaceOrder();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: myPoints } = useMyPoints(user?.id);

  const [step, setStep] = useState<Step>('details');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>('feni');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [trxId, setTrxId] = useState('');
  const [copied, setCopied] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [pointsEarnedSuccess, setPointsEarnedSuccess] = useState(0);
  const [pointsRedeemedSuccess, setPointsRedeemedSuccess] = useState(0);
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discountAmount: number } | null>(null);

  const paymentMethods: { id: PaymentMethod; label: string; icon: React.ReactNode; description: string }[] = [
    { id: 'cod', label: t('checkout.cod'), icon: <Banknote className="h-5 w-5" />, description: t('checkout.codDesc') },
    { id: 'bkash', label: t('checkout.bkash'), icon: <Smartphone className="h-5 w-5" />, description: t('checkout.bkashDesc') },
    { id: 'bank', label: t('checkout.bank'), icon: <Building2 className="h-5 w-5" />, description: t('checkout.bankDesc') },
  ];

  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const deliveryCharge = DELIVERY_CHARGES[deliveryZone];
  const availablePoints = myPoints?.points || 0;
  const canRedeem = isAuthenticated && availablePoints >= 200;
  const maxRedeem = Math.min(availablePoints, total);
  const effectiveRedeem = Math.max(0, Math.min(redeemPoints, maxRedeem));
  const redeemError =
    redeemPoints > 0 && !canRedeem
      ? `রিডিম করতে কমপক্ষে ২০০ পয়েন্ট প্রয়োজন (বর্তমানে ${availablePoints})`
      : redeemPoints > availablePoints
      ? `আপনার কাছে মাত্র ${availablePoints} পয়েন্ট আছে`
      : redeemPoints > total
      ? `সর্বোচ্চ ${total} পয়েন্ট রিডিম করা যাবে (অর্ডার মূল্যের সমান)`
      : '';
  const voucherDiscount = appliedVoucher?.discountAmount || 0;
  const grandTotal = Math.max(0, total - effectiveRedeem - voucherDiscount) + deliveryCharge;
  const willEarn = Math.floor(Math.max(0, total - effectiveRedeem - voucherDiscount) / 100);
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  if (cart.length === 0 && step !== 'done') {
    navigate('/cart');
    return null;
  }

  const needsTrxId = paymentMethod === 'bkash' || paymentMethod === 'bank';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(t('checkout.copied'));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinueToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) { toast.error(t('checkout.enterPhone')); return; }
    if (!address.trim()) { toast.error(t('checkout.enterAddress')); return; }
    if (needsTrxId && !trxId.trim()) { toast.error(t('checkout.enterTrxId')); return; }
    if (redeemError) { toast.error(redeemError); return; }
    setStep('review');
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = async () => {
    if (redeemError) { toast.error(redeemError); return; }
    try {
      const result = await placeOrderMut.mutateAsync({
        type: 'online',
        items: cart,
        data: {
          customerName: name || 'Guest',
          customerEmail: email || undefined,
          customerPhone: phone,
          deliveryAddress: address,
          deliveryZone,
          deliveryCharge,
          paymentMethod,
          paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
          redeemPoints: effectiveRedeem > 0 ? effectiveRedeem : undefined,
          voucherCode: appliedVoucher?.code,
        },
      });
      setOrderId(result.id);
      setOrderTotal(result.total);
      setPointsEarnedSuccess(result.pointsEarned || 0);
      setPointsRedeemedSuccess(result.pointsRedeemed || effectiveRedeem || 0);
      clearCart();
      setStep('done');
      toast.success(t('checkout.orderPlaced'));
    } catch (err: any) {
      toast.error(err.message || 'Order failed');
    }
  };

  const selectedPayment = paymentMethods.find(p => p.id === paymentMethod)!;

  if (step === 'done') return (
    <div className="container mx-auto px-4 py-12 max-w-md text-center animate-fade-in">
      <div className="rounded-2xl border bg-card p-8">
        <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-1">{t('checkout.orderConfirmed')}</h2>
        <p className="text-muted-foreground text-sm mb-6">{t('checkout.orderSuccess')}</p>
        {(pointsEarnedSuccess > 0 || pointsRedeemedSuccess > 0) && (
          <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 space-y-1">
            {pointsRedeemedSuccess > 0 && (
              <div className="flex items-center gap-2 justify-center text-sm">
                <Wallet className="h-4 w-4 text-primary" />
                <p>রিডিম: <span className="text-primary font-bold">{pointsRedeemedSuccess}</span> পয়েন্ট (-৳{pointsRedeemedSuccess})</p>
              </div>
            )}
            {pointsEarnedSuccess > 0 && (
              <div className="flex items-center gap-2 justify-center text-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <p>অর্জিত: <span className="text-primary font-bold">+{pointsEarnedSuccess}</span> পয়েন্ট</p>
              </div>
            )}
          </div>
        )}
        <div className="text-left space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Package className="h-4 w-4 text-primary shrink-0" />
            <div><p className="text-xs text-muted-foreground">Order ID</p><p className="font-mono text-sm font-medium">{orderId.slice(0, 8)}</p></div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <ShoppingBag className="h-4 w-4 text-primary shrink-0" />
            <div><p className="text-xs text-muted-foreground">{t('checkout.total')}</p><p className="text-sm font-bold text-primary">৳{orderTotal.toFixed(0)}</p></div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Wallet className="h-4 w-4 text-primary shrink-0" />
            <div><p className="text-xs text-muted-foreground">{t('checkout.payment')}</p><p className="text-sm font-medium">{selectedPayment.label}</p></div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <div><p className="text-xs text-muted-foreground">{t('checkout.deliveryAddress')}</p><p className="text-sm">{address}</p></div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button asChild size="lg"><Link to="/shop">{t('checkout.moreShopping')}</Link></Button>
          {isAuthenticated && <Button asChild variant="outline" size="sm"><Link to="/account">{t('checkout.myOrders')}</Link></Button>}
        </div>
      </div>
    </div>
  );

  if (step === 'review') return (
    <div className="container mx-auto px-4 py-8 max-w-lg animate-fade-in">
      <button onClick={() => setStep('details')} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> {t('checkout.goBack')}
      </button>
      <h1 className="text-xl font-bold mb-6">{t('checkout.orderReview')}</h1>

      <div className="rounded-2xl border bg-card p-4 mb-4 space-y-2 text-sm">
        <h3 className="font-semibold text-base mb-2">{t('checkout.deliveryDetails')}</h3>
        {name && <div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-muted-foreground" /><span>{name}</span></div>}
        <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /><span>{phone}</span></div>
        {email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /><span>{email}</span></div>}
        <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /><span>{address}</span></div>
        <div className="flex items-center gap-2"><Truck className="h-3.5 w-3.5 text-muted-foreground" /><span>{deliveryZone === 'feni' ? t('checkout.feni') : deliveryZone === 'feni_upozila' ? t('checkout.feniUpozila') : t('checkout.outsideFeni')} — ৳{deliveryCharge}</span></div>
      </div>

      <div className="rounded-2xl border bg-card p-4 mb-4 text-sm">
        <h3 className="font-semibold text-base mb-2">{t('checkout.paymentMethod')}</h3>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <span className="text-primary">{selectedPayment.icon}</span>
          <div><p className="font-medium">{selectedPayment.label}</p><p className="text-xs text-muted-foreground">{selectedPayment.description}</p></div>
        </div>
        {trxId && <p className="mt-2 text-xs text-muted-foreground">TrxID: <span className="font-mono font-medium text-foreground">{trxId}</span></p>}
      </div>

      <div className="rounded-2xl border bg-card p-4 mb-4 space-y-3">
        <h3 className="font-semibold text-base">{t('checkout.products')} ({itemCount})</h3>
        {cart.map(i => (
          <div key={i.product.id} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{i.product.name} × {i.quantity}</span>
            <span className="font-medium">৳{(i.product.price * i.quantity).toFixed(0)}</span>
          </div>
        ))}
        <div className="border-t pt-2 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">{t('checkout.subtotal')}</span><span>৳{total.toFixed(0)}</span></div>
          {effectiveRedeem > 0 && (
            <div className="flex justify-between text-primary"><span>পয়েন্ট রিডিম ({effectiveRedeem})</span><span>-৳{effectiveRedeem.toFixed(0)}</span></div>
          )}
          <div className="flex justify-between"><span className="text-muted-foreground">{t('checkout.delivery')} ({deliveryZone === 'feni' ? t('checkout.feni') : deliveryZone === 'feni_upozila' ? t('checkout.feniUpozila') : t('checkout.outsideFeni')})</span><span>৳{deliveryCharge}</span></div>
        </div>
        <div className="border-t pt-2 flex justify-between font-bold text-lg">
          <span>{t('checkout.total')}</span>
          <span className="text-primary">৳{grandTotal.toFixed(0)}</span>
        </div>
      </div>

      <Button size="lg" className="w-full rounded-full shadow-lg shadow-primary/20" onClick={handlePlaceOrder} disabled={placeOrderMut.isPending || !!redeemError}>
        {placeOrderMut.isPending ? 'Processing...' : `${t('checkout.confirmBtn')} — ৳${grandTotal.toFixed(0)}`}
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg animate-fade-in">
      <button onClick={() => navigate('/cart')} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> {t('checkout.backToCart')}
      </button>
      <h1 className="text-xl font-bold mb-4">{t('checkout.title')}</h1>

      {!isAuthenticated && (
        <div className="rounded-2xl border bg-card p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><User className="h-5 w-5 text-primary" /></div>
            <div><p className="font-medium text-sm">{t('checkout.guestOrder')}</p><p className="text-xs text-muted-foreground">{t('checkout.guestDesc')}</p></div>
          </div>
          <Link to="/login" state={{ from: '/checkout' }} className="block w-full text-center py-2.5 rounded-xl border-2 border-primary/20 bg-primary/5 text-primary text-sm font-medium hover:bg-primary/10 transition-colors">{t('checkout.loginPrompt')}</Link>
        </div>
      )}
      {isAuthenticated && (
        <div className="rounded-2xl border bg-card p-3 mb-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center"><Gift className="h-4 w-4 text-accent" /></div>
          <div><p className="font-medium text-sm">{t('checkout.loggedInAs', { name: user?.name || '' })}</p><p className="text-xs text-muted-foreground">{t('checkout.loggedInAs', { name: user?.name || '' })}</p></div>
        </div>
      )}

      <form onSubmit={handleContinueToReview} className="space-y-4">
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2"><User className="h-4 w-4 text-primary" /> {t('checkout.contact')}</h3>
          <div><Label htmlFor="name">{t('checkout.name')}</Label><Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder={t('checkout.fullName')} /></div>
          <div><Label htmlFor="email">{t('checkout.email')}</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" /></div>
        </div>

        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {t('checkout.deliveryInfo')}</h3>
          <div><Label htmlFor="phone">{t('checkout.phone')} <span className="text-destructive">*</span></Label><Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" required /></div>
          <div>
            <Label htmlFor="address">{t('checkout.address')} <span className="text-destructive">*</span></Label>
            <textarea id="address" value={address} onChange={e => setAddress(e.target.value)} placeholder={t('checkout.addressPlaceholder')} required className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px] resize-none" />
          </div>
          <div>
            <Label className="mb-2 block">{t('checkout.deliveryZone')} <span className="text-destructive">*</span></Label>
            <div className="grid grid-cols-3 gap-2">
              {(['feni', 'feni_upozila', 'outside'] as DeliveryZone[]).map(zone => (
                <button key={zone} type="button" onClick={() => setDeliveryZone(zone)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${deliveryZone === zone ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/30 hover:bg-muted/50'}`}>
                  <div className="flex items-center gap-2">
                    <Truck className={`h-4 w-4 shrink-0 ${deliveryZone === zone ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="font-medium text-xs">{zone === 'feni' ? t('checkout.feni') : zone === 'feni_upozila' ? t('checkout.feniUpozila') : t('checkout.outsideFeni')}</p>
                      <p className="text-xs text-primary font-bold">৳{DELIVERY_CHARGES[zone]}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" /> {t('checkout.paymentMethod')}</h3>
          <div className="grid grid-cols-1 gap-2">
            {paymentMethods.map(pm => (
              <button key={pm.id} type="button" onClick={() => { setPaymentMethod(pm.id); setTrxId(''); }}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${paymentMethod === pm.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-transparent bg-muted/30 hover:bg-muted/50'}`}>
                <span className={paymentMethod === pm.id ? 'text-primary' : 'text-muted-foreground'}>{pm.icon}</span>
                <div className="flex-1 min-w-0"><p className="font-medium text-sm">{pm.label}</p><p className="text-xs text-muted-foreground">{pm.description}</p></div>
                <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === pm.id ? 'border-primary' : 'border-muted-foreground/30'}`}>
                  {paymentMethod === pm.id && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>
              </button>
            ))}
          </div>

          {needsTrxId && (
            <div className="mt-3 p-4 rounded-xl bg-accent/10 border border-accent/20 space-y-3">
              {paymentMethod === 'bkash' && (
                <div className="space-y-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-pink-600">{t('checkout.bkashPersonal')}</p>
                    <div className="flex items-center gap-2 bg-background rounded-lg p-2.5 border">
                      <span className="flex-1 font-mono font-bold text-sm tracking-wider">01715307271</span>
                      <button type="button" onClick={() => copyToClipboard('01715307271')} className="p-1.5 rounded-md hover:bg-muted transition-colors text-primary">
                        {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-orange-600">{t('checkout.nagadPersonal')}</p>
                    <div className="flex items-center gap-2 bg-background rounded-lg p-2.5 border">
                      <span className="flex-1 font-mono font-bold text-sm tracking-wider">01715307271</span>
                      <button type="button" onClick={() => copyToClipboard('01715307271')} className="p-1.5 rounded-md hover:bg-muted transition-colors text-primary">
                        {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {paymentMethod === 'bank' && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-blue-600">{t('checkout.bankTransfer')}</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between bg-background rounded-lg p-2.5 border"><div><p className="text-[10px] text-muted-foreground">{t('checkout.bankName')}</p><p className="text-xs font-medium">BRAC BANK</p></div></div>
                    <div className="flex items-center justify-between bg-background rounded-lg p-2.5 border"><div><p className="text-[10px] text-muted-foreground">Account Name</p><p className="text-xs font-medium">PINK CITY</p></div></div>
                    <div className="flex items-center gap-2 bg-background rounded-lg p-2.5 border">
                      <div className="flex-1"><p className="text-[10px] text-muted-foreground">{t('checkout.accountNumber')}</p><p className="font-mono font-bold text-sm tracking-wider">1802204711537001</p></div>
                      <button type="button" onClick={() => copyToClipboard('1802204711537001')} className="p-1.5 rounded-md hover:bg-muted transition-colors text-primary">{copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}</button>
                    </div>
                    <div className="flex items-center justify-between bg-background rounded-lg p-2.5 border"><div><p className="text-[10px] text-muted-foreground">{t('checkout.branch')}</p><p className="text-xs font-medium">FENI</p></div></div>
                  </div>
                </div>
              )}
              <div className="pt-1 border-t border-accent/20">
                <p className="text-xs text-muted-foreground mb-2">{t('checkout.sendAndEnterTrx', { amount: grandTotal.toFixed(0) })}</p>
                <Label htmlFor="trxId" className="text-xs">Transaction ID <span className="text-destructive">*</span></Label>
                <Input id="trxId" value={trxId} onChange={e => setTrxId(e.target.value)} placeholder={t('checkout.trxPlaceholder')} className="mt-1" />
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-card p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">{t('checkout.nItems', { n: itemCount })}</span><span>৳{total.toFixed(0)}</span></div>
          {effectiveRedeem > 0 && (
            <div className="flex justify-between text-primary font-medium">
              <span>পয়েন্ট রিডিম ({effectiveRedeem})</span>
              <span>-৳{effectiveRedeem.toFixed(0)}</span>
            </div>
          )}
          <div className="flex justify-between"><span className="text-muted-foreground">{t('checkout.delivery')} ({deliveryZone === 'feni' ? t('checkout.feni') : deliveryZone === 'feni_upozila' ? t('checkout.feniUpozila') : t('checkout.outsideFeni')})</span><span>৳{deliveryCharge}</span></div>
          <div className="border-t pt-2 flex justify-between font-bold text-base"><span>{t('checkout.total')}</span><span className="text-primary">৳{grandTotal.toFixed(0)}</span></div>
          {willEarn > 0 && isAuthenticated && (
            <p className="text-xs text-success flex items-center gap-1 pt-1"><Sparkles className="h-3 w-3" /> এই অর্ডারে {willEarn} পয়েন্ট পাবেন</p>
          )}
        </div>

        {isAuthenticated && availablePoints > 0 && (
          <div className="rounded-2xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> রিওয়ার্ড পয়েন্ট</h3>
              <span className="text-sm font-bold text-primary">{availablePoints} পয়েন্ট</span>
            </div>
            {canRedeem ? (
              <>
                <p className="text-xs text-muted-foreground">১ পয়েন্ট = ১ টাকা। সর্বনিম্ন ২০০ পয়েন্ট থেকে রিডিম করতে পারবেন।</p>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    min={0}
                    max={maxRedeem}
                    value={redeemPoints || ''}
                    onChange={e => setRedeemPoints(Math.max(0, Math.min(maxRedeem, parseInt(e.target.value) || 0)))}
                    placeholder="কত পয়েন্ট রিডিম?"
                    className="flex-1"
                  />
                  <Button type="button" size="sm" variant="outline" onClick={() => setRedeemPoints(maxRedeem)}>সর্বোচ্চ</Button>
                  {redeemPoints > 0 && <Button type="button" size="sm" variant="ghost" onClick={() => setRedeemPoints(0)}>বাতিল</Button>}
                </div>
                {redeemError && <p className="text-xs text-destructive font-medium">{redeemError}</p>}
              </>
            ) : (
              <p className="text-xs text-muted-foreground">রিডিম করতে কমপক্ষে ২০০ পয়েন্ট প্রয়োজন। (বর্তমানে {availablePoints})</p>
            )}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full rounded-full shadow-lg shadow-primary/20">{t('checkout.reviewBtn')}</Button>
      </form>
    </div>
  );
}
