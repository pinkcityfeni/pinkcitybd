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
      <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-5">
        <ShoppingBag className="h-9 w-9 text-muted-foreground/40" />
      </div>
      <h2 className="font-display text-xl font-bold mb-2">Your cart is empty</h2>
      <p className="text-sm text-muted-foreground mb-6">Add some beautiful products to get started</p>
      <Button asChild className="rounded-full px-6"><Link to="/shop">Start Shopping</Link></Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <h1 className="font-display text-xl font-bold mb-4">Shopping Cart <span className="text-muted-foreground font-sans text-xs font-normal">({itemCount} items)</span></h1>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-2">
          {cart.map(item => {
            const currentProduct = products.find(p => p.id === item.product.id);
            const maxStock = currentProduct?.stock || item.product.stock;

            return (
              <div key={item.product.id} className="rounded-2xl border bg-card p-3 space-y-2">
                {/* Top row: image + name + delete */}
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                    <span className="text-lg">💎</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product.id}`} className="font-medium text-sm truncate block hover:text-primary transition-colors">{item.product.name}</Link>
                    <p className="text-xs text-muted-foreground">৳{item.product.price.toFixed(2)} each</p>
                    {maxStock < 10 && <p className="text-[10px] text-destructive">{maxStock} left</p>}
                  </div>
                  <button onClick={() => removeFromCart(item.product.id)} className="p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {/* Bottom row: qty + price */}
                <div className="flex items-center justify-between pl-[60px]">
                  <div className="flex items-center gap-1">
                    <button
                      className="h-7 w-7 rounded-full border flex items-center justify-center hover:bg-muted transition-colors"
                      onClick={() => {
                        if (item.quantity <= 1) { removeFromCart(item.product.id); return; }
                        updateCartQty(item.product.id, item.quantity - 1);
                      }}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      className="h-7 w-7 rounded-full border flex items-center justify-center hover:bg-muted transition-colors"
                      onClick={() => {
                        if (item.quantity >= maxStock) { toast.error('Max stock reached'); return; }
                        updateCartQty(item.product.id, item.quantity + 1);
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="font-display font-bold text-sm">৳{(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border bg-card p-4 h-fit space-y-3">
          <h3 className="font-display font-bold text-sm">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">৳{total.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="font-medium">{total > 50 ? <span className="text-green-600">Free</span> : '৳5.00'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Points earned</span><span className="text-primary font-medium">+{points} pts</span></div>
          </div>
          <div className="border-t pt-3 flex justify-between font-bold">
            <span className="font-display">Total</span>
            <span className="font-display text-primary">৳{(total + shipping).toFixed(2)}</span>
          </div>
          <Button asChild className="w-full rounded-full shadow-lg shadow-primary/20" size="lg">
            <Link to="/checkout">Checkout <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button asChild variant="ghost" className="w-full rounded-full" size="sm">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
