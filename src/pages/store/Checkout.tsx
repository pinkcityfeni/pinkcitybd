import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '@/data/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';

export default function Checkout() {
  const { cart, placeOrder } = useStore();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState('');

  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const shipping = total > 50 ? 0 : 5;

  if (cart.length === 0 && !done) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = placeOrder('online', name || 'Guest', email);
    setOrderId(id);
    setDone(true);
    toast.success('Order placed successfully!');
  };

  if (done) return (
    <div className="container mx-auto px-4 py-20 text-center animate-fade-in">
      <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
      <p className="text-muted-foreground mb-1">Order ID: <span className="font-mono">{orderId}</span></p>
      <p className="text-muted-foreground mb-6">Thank you for your purchase</p>
      <Button asChild><Link to="/shop">Continue Shopping</Link></Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg animate-fade-in">
      <h1 className="page-header mb-6">Checkout</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="stat-card space-y-4">
          <h3 className="font-semibold">Contact Details <span className="text-xs text-muted-foreground font-normal">(optional for guest)</span></h3>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
          </div>
        </div>

        <div className="stat-card space-y-2 text-sm">
          <h3 className="font-semibold text-base">Summary</h3>
          {cart.map(i => (
            <div key={i.product.id} className="flex justify-between">
              <span className="text-muted-foreground">{i.product.name} × {i.quantity}</span>
              <span>${(i.product.price * i.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
          <div className="border-t pt-2 flex justify-between font-bold text-base">
            <span>Total</span><span>${(total + shipping).toFixed(2)}</span>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full">Place Order</Button>
      </form>
    </div>
  );
}
