import { useStore } from '@/data/store';
import { useLanguage } from '@/data/language';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useMemo } from 'react';

export default function Wishlist() {
  const wishlist = useStore(s => s.wishlist);
  const products = useStore(s => s.products);
  const toggleWishlist = useStore(s => s.toggleWishlist);
  const addToCart = useStore(s => s.addToCart);
  const { t } = useLanguage();

  const wishedProducts = useMemo(() => products.filter(p => wishlist.includes(p.id)), [products, wishlist]);

  if (wishedProducts.length === 0) return (
    <div className="container mx-auto px-4 py-20 text-center animate-fade-in">
      <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-5">
        <Heart className="h-9 w-9 text-muted-foreground/40" />
      </div>
      <h2 className="font-display text-xl font-bold mb-2">{t('account.wishlist')}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t('cart.emptyDesc')}</p>
      <Button asChild className="rounded-full px-6"><Link to="/shop">{t('cart.startShopping')}</Link></Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <h1 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
        <Heart className="h-5 w-5 text-destructive" /> {t('nav.wishlist')} ({wishedProducts.length})
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {wishedProducts.map(p => (
          <div key={p.id} className="rounded-2xl border bg-card overflow-hidden group hover:shadow-lg transition-all">
            <Link to={`/product/${p.id}`}>
              <div className="aspect-square bg-muted/30 flex items-center justify-center overflow-hidden">
                {p.image ? <img src={p.image} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" /> : <span className="text-4xl">💎</span>}
              </div>
            </Link>
            <div className="p-3 space-y-2">
              <Link to={`/product/${p.id}`}>
                <p className="text-sm font-medium line-clamp-1 hover:text-primary transition-colors">{p.name}</p>
              </Link>
              <p className="text-base font-bold text-primary">৳{p.price.toFixed(0)}</p>
              <div className="flex gap-1.5">
                <Button size="sm" className="flex-1 rounded-full text-xs h-8" onClick={() => { addToCart(p); toast.success('Added to cart'); }}>
                  <ShoppingCart className="h-3 w-3 mr-1" /> {t('product.addToCart')}
                </Button>
                <Button size="sm" variant="ghost" className="rounded-full h-8 w-8 p-0 text-destructive hover:bg-destructive/10" onClick={() => toggleWishlist(p.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
