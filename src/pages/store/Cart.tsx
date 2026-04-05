import { Link } from 'react-router-dom';
import { useStore } from '@/data/store';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Cart() {
  const { cart, removeFromCart, updateCartQty } = useStore();
  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const points = Math.floor(total);

  if (cart.length === 0) return (
    <div className="container mx-auto px-4 py-20 text-center animate-fade-in">
      <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
      <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
      <p className="text-muted-foreground mb-6">Add some products to get started</p>
      <Button asChild><Link to="/shop">Continue Shopping</Link></Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="page-header mb-6">Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {cart.map(item => (
            <div key={item.product.id} className="stat-card flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <span className="text-2xl">📦</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{item.product.name}</h3>
                <p className="text-sm text-primary font-bold">${item.product.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center border rounded-lg">
                <button className="px-2 py-1 hover:bg-muted text-sm" onClick={() => updateCartQty(item.product.id, item.quantity - 1)}>−</button>
                <span className="px-2 py-1 min-w-[2rem] text-center text-sm">{item.quantity}</span>
                <button className="px-2 py-1 hover:bg-muted text-sm" onClick={() => updateCartQty(item.product.id, item.quantity + 1)}>+</button>
              </div>
              <p className="font-bold text-sm w-20 text-right">${(item.product.price * item.quantity).toFixed(2)}</p>
              <button onClick={() => removeFromCart(item.product.id)} className="p-1 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="stat-card h-fit space-y-4">
          <h3 className="font-bold">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${total.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{total > 50 ? 'Free' : '$5.00'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Points earned</span><span className="text-accent">{points} pts</span></div>
          </div>
          <div className="border-t pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span>${(total > 50 ? total : total + 5).toFixed(2)}</span>
          </div>
          <Button asChild className="w-full" size="lg">
            <Link to="/checkout">Checkout <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
