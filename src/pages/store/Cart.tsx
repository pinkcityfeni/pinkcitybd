import { Link } from 'react-router-dom';
import { useStore } from '@/data/store';
import { useLanguage } from '@/data/language';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function Cart() {
  const cart = useStore(s => s.cart);
  const removeFromCart = useStore(s => s.removeFromCart);
  const updateCartQty = useStore(s => s.updateCartQty);
  const products = useStore(s => s.products);
  const { t } = useLanguage();
  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const points = Math.floor(total);
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  if (cart.length === 0) return (
    <div className="container mx-auto px-4 py-20 text-center animate-fade-in">
      <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-5">
        <ShoppingBag className="h-9 w-9 text-muted-foreground/40" />
      </div>
      <h2 className="font-display text-xl font-bold mb-2">{t('cart.empty')}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t('cart.emptyDesc')}</p>
      <Button asChild className="rounded-full px-6"><Link to="/shop">{t('cart.startShopping')}</Link></Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <h1 className="font-display text-xl font-bold mb-4">{t('cart.title')} <span className="text-muted-foreground font-sans text-xs font-normal">({t('cart.items', { n: itemCount })})</span></h1>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-2">
          {cart.map(item => {
            const currentProduct = products.find(p => p.id === item.product.id);
            const maxStock = currentProduct?.stock || item.product.stock;
            return (
              <div key={item.product.id} className="rounded-2xl border bg-card p-3 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                    <span className="text-lg">💎</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product.id}`} className="font-medium text-sm truncate block hover:text-primary transition-colors">{item.product.name}</Link>
                    <p className="text-xs text-muted-foreground">{t('cart.each', { price: item.product.price.toFixed(0) })}</p>
                    {maxStock < 10 && <p className="text-[10px] text-destructive">{t('cart.remaining', { n: maxStock })}</p>}
                  </div>
                  <button onClick={() => removeFromCart(item.product.id)} className="p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
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
                        if (item.quantity >= maxStock) { toast.error(t('cart.maxStock')); return; }
                        updateCartQty(item.product.id, item.quantity + 1);
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="font-display font-bold text-sm">৳{(item.product.price * item.quantity).toFixed(0)}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border bg-card p-4 h-fit space-y-3">
          <h3 className="font-display font-bold text-sm">{t('cart.orderSummary')}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">{t('cart.subtotal')}</span><span className="font-medium">৳{total.toFixed(0)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t('cart.deliveryCharge')}</span><span className="text-xs text-muted-foreground">{t('cart.seeAtCheckout')}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t('cart.points')}</span><span className="text-primary font-medium">+{points} pts</span></div>
          </div>
          <div className="border-t pt-3 flex justify-between font-bold">
            <span className="font-display">{t('cart.subtotal')}</span>
            <span className="font-display text-primary">৳{total.toFixed(0)}</span>
          </div>
          <Button asChild className="w-full rounded-full shadow-lg shadow-primary/20" size="lg">
            <Link to="/checkout">{t('cart.checkout')} <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button asChild variant="ghost" className="w-full rounded-full" size="sm">
            <Link to="/shop">{t('cart.continueShopping')}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
