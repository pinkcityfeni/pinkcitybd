import { Link } from 'react-router-dom';
import { useStore } from '@/data/store';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function Cart() {
  const { cart, removeFromCart, updateCartQty, products } = useStore();
  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const shipping = total > 50 ? 0 : 5;
  const points = Math.floor(total);
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

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
      <h1 className="text-xl font-bold mb-6">Shopping Cart ({itemCount} items)</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {cart.map(item => {
            const currentProduct = products.find(p => p.id === item.product.id);
            const maxStock = currentProduct?.stock || item.product.stock;

            return (
              <div key={item.product.id} className="rounded-xl border bg-card p-4 flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product.id}`} className="font-semibold text-sm truncate block hover:text-primary">{item.product.name}</Link>
                  <p className="text-sm text-primary font-bold">${item.product.price.toFixed(2)}</p>
                  {maxStock < 10 && <p className="text-[10px] text-destructive">{maxStock} left in stock</p>}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="h-7 w-7 rounded-md border flex items-center justify-center hover:bg-muted"
                    onClick={() => {
                      if (item.quantity <= 1) { removeFromCart(item.product.id); return; }
                      updateCartQty(item.product.id, item.quantity - 1);
                    }}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    className="h-7 w-7 rounded-md border flex items-center justify-center hover:bg-muted"
                    onClick={() => {
                      if (item.quantity >= maxStock) { toast.error('Max stock reached'); return; }
                      updateCartQty(item.product.id, item.quantity + 1);
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <p className="font-bold text-sm w-20 text-right">${(item.product.price * item.quantity).toFixed(2)}</p>
                <button onClick={() => removeFromCart(item.product.id)} className="p-1 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
        <div className="rounded-xl border bg-card p-5 h-fit space-y-4">
          <h3 className="font-bold">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal ({itemCount} items)</span><span>${total.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{total > 50 ? 'Free' : '$5.00'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Points earned</span><span className="text-accent">{points} pts</span></div>
          </div>
          <div className="border-t pt-3 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">${(total + shipping).toFixed(2)}</span>
          </div>
          <Button asChild className="w-full" size="lg">
            <Link to="/checkout">Checkout <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button asChild variant="outline" className="w-full" size="sm">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
