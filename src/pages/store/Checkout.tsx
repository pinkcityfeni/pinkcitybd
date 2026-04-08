import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '@/data/store';
import { useAuth } from '@/data/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle2, ShoppingBag, ArrowLeft, MapPin, Phone, Mail, User, Package, Gift, Wallet, CreditCard, Building2, Banknote, Smartphone, Copy, Check, Lock, Truck } from 'lucide-react';
import type { PaymentMethod, DeliveryZone } from '@/data/store';

type Step = 'details' | 'review' | 'done';

const paymentMethods: { id: PaymentMethod; label: string; labelBn: string; icon: React.ReactNode; description: string }[] = [
  { id: 'cod', label: 'Cash on Delivery', labelBn: 'ক্যাশ অন ডেলিভারি', icon: <Banknote className="h-5 w-5" />, description: 'পণ্য হাতে পেয়ে টাকা দিন' },
  { id: 'bkash', label: 'bKash', labelBn: 'বিকাশ', icon: <Smartphone className="h-5 w-5" />, description: 'বিকাশ দিয়ে আগেই পেমেন্ট করুন' },
  { id: 'nagad', label: 'Nagad', labelBn: 'নগদ', icon: <Smartphone className="h-5 w-5" />, description: 'নগদ দিয়ে আগেই পেমেন্ট করুন' },
  { id: 'card', label: 'Card', labelBn: 'কার্ড', icon: <CreditCard className="h-5 w-5" />, description: 'ডেবিট/ক্রেডিট কার্ড' },
  { id: 'bank', label: 'Bank Transfer', labelBn: 'ব্যাংক ট্রান্সফার', icon: <Building2 className="h-5 w-5" />, description: 'ব্যাংক অ্যাকাউন্ট থেকে পাঠান' },
];

const DELIVERY_CHARGES: Record<DeliveryZone, number> = {
  feni: 30,
  outside: 150,
};

export default function Checkout() {
  const { cart, placeOrder } = useStore();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('details');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>('dhaka');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [trxId, setTrxId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [copied, setCopied] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderPoints, setOrderPoints] = useState(0);

  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const deliveryCharge = DELIVERY_CHARGES[deliveryZone];
  const grandTotal = total + deliveryCharge;
  const points = Math.floor(total);
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  if (cart.length === 0 && step !== 'done') {
    navigate('/cart');
    return null;
  }

  const needsTrxId = paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'bank';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('কপি হয়েছে!');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCardNumber = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const handleContinueToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) { toast.error('ফোন নম্বর দিন'); return; }
    if (!address.trim()) { toast.error('ডেলিভারি ঠিকানা দিন'); return; }
    if (needsTrxId && !trxId.trim()) { toast.error('Transaction ID দিন'); return; }
    if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) { toast.error('সম্পূর্ণ কার্ড নম্বর দিন'); return; }
      if (cardExpiry.length < 5) { toast.error('কার্ডের মেয়াদ দিন (MM/YY)'); return; }
      if (cardCvv.length < 3) { toast.error('CVV দিন'); return; }
      if (!cardName.trim()) { toast.error('কার্ডধারীর নাম দিন'); return; }
    }
    setStep('review');
  };

  const handlePlaceOrder = () => {
    const savedTotal = grandTotal;
    const savedPoints = points;
    const id = placeOrder('online', {
      customerName: name || 'Guest',
      customerEmail: email || undefined,
      customerPhone: phone,
      deliveryAddress: address,
      deliveryZone,
      deliveryCharge,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
    });
    setOrderId(id);
    setOrderTotal(savedTotal);
    setOrderPoints(savedPoints);
    setStep('done');
    toast.success('অর্ডার সফলভাবে প্লেস হয়েছে!');
  };

  const selectedPayment = paymentMethods.find(p => p.id === paymentMethod)!;

  // ─── Order Confirmation ───
  if (step === 'done') return (
    <div className="container mx-auto px-4 py-12 max-w-md text-center animate-fade-in">
      <div className="rounded-2xl border bg-card p-8">
        <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-1">অর্ডার কনফার্ম!</h2>
        <p className="text-muted-foreground text-sm mb-6">আপনার অর্ডার সফলভাবে প্লেস হয়েছে</p>

        <div className="text-left space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Package className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Order ID</p>
              <p className="font-mono text-sm font-medium">{orderId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <ShoppingBag className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">মোট</p>
              <p className="text-sm font-bold text-primary">৳{orderTotal.toFixed(0)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Wallet className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">পেমেন্ট</p>
              <p className="text-sm font-medium">{selectedPayment.label}</p>
            </div>
          </div>
          {orderPoints > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10">
              <Gift className="h-4 w-4 text-accent shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">পয়েন্ট</p>
                <p className="text-sm font-bold text-accent">{orderPoints} পয়েন্ট</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">ডেলিভারি ঠিকানা</p>
              <p className="text-sm">{address}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button asChild size="lg"><Link to="/shop">আরো শপিং করুন</Link></Button>
          {isAuthenticated && (
            <Button asChild variant="outline" size="sm"><Link to="/account">আমার অর্ডার দেখুন</Link></Button>
          )}
        </div>
      </div>
    </div>
  );

  // ─── Review Step ───
  if (step === 'review') return (
    <div className="container mx-auto px-4 py-8 max-w-lg animate-fade-in">
      <button onClick={() => setStep('details')} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> পিছনে যান
      </button>
      <h1 className="text-xl font-bold mb-6">অর্ডার রিভিউ</h1>

      <div className="rounded-2xl border bg-card p-4 mb-4 space-y-2 text-sm">
        <h3 className="font-semibold text-base mb-2">ডেলিভারি তথ্য</h3>
        {name && <div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-muted-foreground" /><span>{name}</span></div>}
        <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /><span>{phone}</span></div>
        {email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /><span>{email}</span></div>}
        <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /><span>{address}</span></div>
        <div className="flex items-center gap-2"><Truck className="h-3.5 w-3.5 text-muted-foreground" /><span>{deliveryZone === 'dhaka' ? 'ঢাকার ভিতরে' : 'ঢাকার বাইরে'} — ৳{deliveryCharge}</span></div>
      </div>

      <div className="rounded-2xl border bg-card p-4 mb-4 text-sm">
        <h3 className="font-semibold text-base mb-2">পেমেন্ট মেথড</h3>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <span className="text-primary">{selectedPayment.icon}</span>
          <div>
            <p className="font-medium">{selectedPayment.label}</p>
            <p className="text-xs text-muted-foreground">{selectedPayment.description}</p>
          </div>
        </div>
        {trxId && (
          <p className="mt-2 text-xs text-muted-foreground">TrxID: <span className="font-mono font-medium text-foreground">{trxId}</span></p>
        )}
      </div>

      <div className="rounded-2xl border bg-card p-4 mb-4 space-y-3">
        <h3 className="font-semibold text-base">পণ্য ({itemCount})</h3>
        {cart.map(i => (
          <div key={i.product.id} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{i.product.name} × {i.quantity}</span>
            <span className="font-medium">৳{(i.product.price * i.quantity).toFixed(0)}</span>
          </div>
        ))}
        <div className="border-t pt-2 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">সাবটোটাল</span><span>৳{total.toFixed(0)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">ডেলিভারি ({deliveryZone === 'dhaka' ? 'ঢাকা' : 'ঢাকার বাইরে'})</span><span>৳{deliveryCharge}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">পয়েন্ট</span><span className="text-accent">+{points} pts</span></div>
        </div>
        <div className="border-t pt-2 flex justify-between font-bold text-lg">
          <span>মোট</span>
          <span className="text-primary">৳{grandTotal.toFixed(0)}</span>
        </div>
      </div>

      <Button size="lg" className="w-full rounded-full shadow-lg shadow-primary/20" onClick={handlePlaceOrder}>
        অর্ডার কনফার্ম করুন — ৳{grandTotal.toFixed(0)}
      </Button>
    </div>
  );

  // ─── Details Step ───
  return (
    <div className="container mx-auto px-4 py-8 max-w-lg animate-fade-in">
      <button onClick={() => navigate('/cart')} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> কার্টে ফিরুন
      </button>
      <h1 className="text-xl font-bold mb-1">চেকআউট</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {isAuthenticated ? `${user?.name} হিসেবে লগইন আছেন` : 'গেস্ট হিসেবে কিনছেন'}
        {!isAuthenticated && (
          <> · <Link to="/login" className="text-primary hover:underline">লগইন</Link> করে পয়েন্ট পান</>
        )}
      </p>

      <form onSubmit={handleContinueToReview} className="space-y-4">
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> যোগাযোগ
          </h3>
          <div>
            <Label htmlFor="name">নাম</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="আপনার পূর্ণ নাম" />
          </div>
          <div>
            <Label htmlFor="email">ইমেইল</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> ডেলিভারি তথ্য
          </h3>
          <div>
            <Label htmlFor="phone">ফোন নম্বর <span className="text-destructive">*</span></Label>
            <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" required />
          </div>
          <div>
            <Label htmlFor="address">ডেলিভারি ঠিকানা <span className="text-destructive">*</span></Label>
            <textarea
              id="address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="পূর্ণ ঠিকানা লিখুন - এলাকা, শহর..."
              required
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px] resize-none"
            />
          </div>

          {/* Delivery Zone */}
          <div>
            <Label className="mb-2 block">ডেলিভারি এলাকা <span className="text-destructive">*</span></Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryZone('dhaka')}
                className={`p-3 rounded-xl border-2 text-left transition-all ${deliveryZone === 'dhaka' ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/30 hover:bg-muted/50'}`}
              >
                <div className="flex items-center gap-2">
                  <Truck className={`h-4 w-4 ${deliveryZone === 'dhaka' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="font-medium text-sm">ঢাকার ভিতরে</p>
                    <p className="text-xs text-primary font-bold">৳৬০</p>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryZone('outside')}
                className={`p-3 rounded-xl border-2 text-left transition-all ${deliveryZone === 'outside' ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/30 hover:bg-muted/50'}`}
              >
                <div className="flex items-center gap-2">
                  <Truck className={`h-4 w-4 ${deliveryZone === 'outside' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="font-medium text-sm">ঢাকার বাইরে</p>
                    <p className="text-xs text-primary font-bold">৳১২০</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" /> পেমেন্ট মেথড
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {paymentMethods.map(pm => (
              <button
                key={pm.id}
                type="button"
                onClick={() => { setPaymentMethod(pm.id); setTrxId(''); setCardNumber(''); setCardExpiry(''); setCardCvv(''); setCardName(''); }}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                  paymentMethod === pm.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-transparent bg-muted/30 hover:bg-muted/50'
                }`}
              >
                <span className={paymentMethod === pm.id ? 'text-primary' : 'text-muted-foreground'}>{pm.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{pm.label}</p>
                  <p className="text-xs text-muted-foreground">{pm.description}</p>
                </div>
                <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === pm.id ? 'border-primary' : 'border-muted-foreground/30'}`}>
                  {paymentMethod === pm.id && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>
              </button>
            ))}
          </div>

          {needsTrxId && (
            <div className="mt-3 p-4 rounded-xl bg-accent/10 border border-accent/20 space-y-3">
              {paymentMethod === 'bkash' && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-pink-600">📱 বিকাশ (Personal)</p>
                  <div className="flex items-center gap-2 bg-background rounded-lg p-2.5 border">
                    <span className="flex-1 font-mono font-bold text-sm tracking-wider">01XXXXXXXXX</span>
                    <button type="button" onClick={() => copyToClipboard('01XXXXXXXXX')} className="p-1.5 rounded-md hover:bg-muted transition-colors text-primary">
                      {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
              {paymentMethod === 'nagad' && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-orange-600">📱 নগদ (Personal)</p>
                  <div className="flex items-center gap-2 bg-background rounded-lg p-2.5 border">
                    <span className="flex-1 font-mono font-bold text-sm tracking-wider">01XXXXXXXXX</span>
                    <button type="button" onClick={() => copyToClipboard('01XXXXXXXXX')} className="p-1.5 rounded-md hover:bg-muted transition-colors text-primary">
                      {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
              {paymentMethod === 'bank' && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-blue-600">🏦 ব্যাংক ট্রান্সফার</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between bg-background rounded-lg p-2.5 border">
                      <div>
                        <p className="text-[10px] text-muted-foreground">ব্যাংক</p>
                        <p className="text-xs font-medium">ABC Bank</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-background rounded-lg p-2.5 border">
                      <div className="flex-1">
                        <p className="text-[10px] text-muted-foreground">অ্যাকাউন্ট নম্বর</p>
                        <p className="font-mono font-bold text-sm tracking-wider">123456789</p>
                      </div>
                      <button type="button" onClick={() => copyToClipboard('123456789')} className="p-1.5 rounded-md hover:bg-muted transition-colors text-primary">
                        {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between bg-background rounded-lg p-2.5 border">
                      <div>
                        <p className="text-[10px] text-muted-foreground">ব্রাঞ্চ</p>
                        <p className="text-xs font-medium">Dhaka</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="pt-1 border-t border-accent/20">
                <p className="text-xs text-muted-foreground mb-2">৳{grandTotal.toFixed(0)} পাঠিয়ে নিচে Transaction ID দিন</p>
                <Label htmlFor="trxId" className="text-xs">Transaction ID <span className="text-destructive">*</span></Label>
                <Input id="trxId" value={trxId} onChange={e => setTrxId(e.target.value)} placeholder="TrxID লিখুন" className="mt-1" />
              </div>
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="mt-3 p-4 rounded-xl bg-accent/10 border border-accent/20 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Lock className="h-3.5 w-3.5 text-success" />
                <p className="text-xs font-medium text-success">সিকিউর পেমেন্ট</p>
              </div>
              <div>
                <Label htmlFor="cardName" className="text-xs">কার্ডধারীর নাম <span className="text-destructive">*</span></Label>
                <Input id="cardName" value={cardName} onChange={e => setCardName(e.target.value)} placeholder="CARDHOLDER NAME" className="mt-1 uppercase" />
              </div>
              <div>
                <Label htmlFor="cardNumber" className="text-xs">কার্ড নম্বর <span className="text-destructive">*</span></Label>
                <div className="relative mt-1">
                  <Input
                    id="cardNumber"
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="0000 0000 0000 0000"
                    className="pr-10 font-mono tracking-wider"
                    maxLength={19}
                  />
                  <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="cardExpiry" className="text-xs">মেয়াদ <span className="text-destructive">*</span></Label>
                  <Input id="cardExpiry" value={cardExpiry} onChange={e => setCardExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" className="mt-1 font-mono" maxLength={5} />
                </div>
                <div>
                  <Label htmlFor="cardCvv" className="text-xs">CVV <span className="text-destructive">*</span></Label>
                  <Input id="cardCvv" type="password" value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="•••" className="mt-1 font-mono" maxLength={4} />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Lock className="h-3 w-3" /> আপনার কার্ডের তথ্য সম্পূর্ণ নিরাপদ
              </p>
            </div>
          )}
        </div>

        {/* Quick summary */}
        <div className="rounded-2xl border bg-card p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">{itemCount}টি পণ্য</span><span>৳{total.toFixed(0)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">ডেলিভারি ({deliveryZone === 'dhaka' ? 'ঢাকা' : 'ঢাকার বাইরে'})</span><span>৳{deliveryCharge}</span></div>
          <div className="border-t pt-2 flex justify-between font-bold text-base">
            <span>মোট</span><span className="text-primary">৳{grandTotal.toFixed(0)}</span>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full rounded-full shadow-lg shadow-primary/20">
          অর্ডার রিভিউ করুন
        </Button>
      </form>
    </div>
  );
}
