import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '@/data/store';
import { useAuth } from '@/data/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle2, ShoppingBag, ArrowLeft, MapPin, Phone, Mail, User, Package, Gift } from 'lucide-react';

type Step = 'details' | 'review' | 'done';

export default function Checkout() {
  const { cart, placeOrder } = useStore();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('details');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [orderId, setOrderId] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderPoints, setOrderPoints] = useState(0);

  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const shipping = total > 50 ? 0 : 5;
  const grandTotal = total + shipping;
  const points = Math.floor(total);
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  if (cart.length === 0 && step !== 'done') {
    navigate('/cart');
    return null;
  }

  const handleContinueToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error('Phone number is required');
      return;
    }
    if (!address.trim()) {
      toast.error('Delivery address is required');
      return;
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
    });
    setOrderId(id);
    setOrderTotal(savedTotal);
    setOrderPoints(savedPoints);
    setStep('done');
    toast.success('Order placed successfully!');
  };

  // ─── Order Confirmation ───
  if (step === 'done') return (
    <div className="container mx-auto px-4 py-12 max-w-md text-center animate-fade-in">
      <div className="rounded-2xl border bg-card p-8">
        <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-1">Order Confirmed!</h2>
        <p className="text-muted-foreground text-sm mb-6">Thank you for your purchase</p>

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
              <p className="text-xs text-muted-foreground">Total Paid</p>
              <p className="text-sm font-bold text-primary">${orderTotal.toFixed(2)}</p>
            </div>
          </div>
          {orderPoints > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10">
              <Gift className="h-4 w-4 text-accent shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Points Earned</p>
                <p className="text-sm font-bold text-accent">{orderPoints} points</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Delivering To</p>
              <p className="text-sm">{address}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button asChild size="lg">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
          {isAuthenticated && (
            <Button asChild variant="outline" size="sm">
              <Link to="/account">View My Orders</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  // ─── Review Step ───
  if (step === 'review') return (
    <div className="container mx-auto px-4 py-8 max-w-lg animate-fade-in">
      <button onClick={() => setStep('details')} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Details
      </button>
      <h1 className="text-xl font-bold mb-6">Review Your Order</h1>

      {/* Customer info summary */}
      <div className="rounded-2xl border bg-card p-4 mb-4 space-y-2 text-sm">
        <h3 className="font-semibold text-base mb-2">Delivery Details</h3>
        {name && <div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-muted-foreground" /><span>{name}</span></div>}
        <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /><span>{phone}</span></div>
        {email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /><span>{email}</span></div>}
        <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /><span>{address}</span></div>
      </div>

      {/* Items */}
      <div className="rounded-2xl border bg-card p-4 mb-4 space-y-3">
        <h3 className="font-semibold text-base">Items ({itemCount})</h3>
        {cart.map(i => (
          <div key={i.product.id} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{i.product.name} × {i.quantity}</span>
            <span className="font-medium">${(i.product.price * i.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t pt-2 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${total.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Points</span><span className="text-accent">+{points} pts</span></div>
        </div>
        <div className="border-t pt-2 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-primary">${grandTotal.toFixed(2)}</span>
        </div>
      </div>

      <Button size="lg" className="w-full" onClick={handlePlaceOrder}>
        Confirm & Place Order — ${grandTotal.toFixed(2)}
      </Button>
    </div>
  );

  // ─── Details Step ───
  return (
    <div className="container mx-auto px-4 py-8 max-w-lg animate-fade-in">
      <button onClick={() => navigate('/cart')} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Cart
      </button>
      <h1 className="text-xl font-bold mb-1">Checkout</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {isAuthenticated ? `Logged in as ${user?.name}` : 'Checking out as guest'}
        {!isAuthenticated && (
          <> · <Link to="/login" className="text-primary hover:underline">Login</Link> to earn points</>
        )}
      </p>

      <form onSubmit={handleContinueToReview} className="space-y-4">
        {/* Contact */}
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> Contact Info
            {!isAuthenticated && <span className="text-xs text-muted-foreground font-normal">(optional for guest)</span>}
          </h3>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
          </div>
        </div>

        {/* Delivery */}
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Delivery Details
          </h3>
          <div>
            <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              required
            />
          </div>
          <div>
            <Label htmlFor="address">Delivery Address <span className="text-destructive">*</span></Label>
            <textarea
              id="address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Full delivery address with area, city..."
              required
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px] resize-none"
            />
          </div>
        </div>

        {/* Quick summary */}
        <div className="rounded-2xl border bg-card p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">{itemCount} items</span><span>${total.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
          <div className="border-t pt-2 flex justify-between font-bold text-base">
            <span>Total</span><span className="text-primary">${grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full rounded-full shadow-lg shadow-primary/20">
          Review Order
        </Button>
      </form>
    </div>
  );
}
