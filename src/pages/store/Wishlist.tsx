import { useStore } from '@/data/store';
import { useLanguage } from '@/data/language';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useMemo } from 'react';
import { usePublicProducts } from '@/hooks/useSupabaseData';

export default function Wishlist() {
  const wishlist = useStore(s => s.wishlist);
  const { data: products = [] } = usePublicProducts();
  const toggleWishlist = useStore(s => s.toggleWishlist);
  const addToCart = useStore(s => s.addToCart);
  const { t } = useLanguage();
  const wishedProducts = useMemo(() => products.filter(p => wishlist.includes(p.id)), [products, wishlist]);

  if (wishedProducts.length === 0) return (
    <div className="container mx-auto px-4 py-20 text-center animate-fade-in">
      <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center mx-auto mb-5"><Heart className="h-8 w-8 text-muted-foreground/40" /></div>
      <h2 className="font-display text-xl font-bold mb-2">{t('account.wishlist')}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t('cart.emptyDesc')}</p>
      <Button asChild className="rounded-lg px-8"><Link to="/shop">{t('cart.startShopping')}</Link></Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <h1 className="font-display text-xl font-bold mb-1 flex items-center gap-2"><Heart className="h-5 w-5 text-destructive" /> {t('nav.wishlist')}</h1>
      <p className="text-xs text-muted-foreground mb-5">{wishedProducts.length} items</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {wishedProducts.map(p => (
          <div key={p.id} className="product-card group">
            <Link to={`/product/${p.id}`}>
              <div className="aspect-square bg-secondary/30 flex items-center justify-center overflow-hidden">
                {p.image ? <img src={p.image} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <span className="text-4xl">💎</span>}
              </div>
            </Link>
            <div className="p-3 space-y-2">
              <Link to={`/product/${p.id}`}><p className="text-sm font-medium line-clamp-1 hover:text-primary transition-colors">{p.name}</p></Link>
              <p className="font-bold text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>৳{p.price.toFixed(0)}</p>
              <div className="flex gap-1.5">
                <Button size="sm" className="flex-1 rounded-lg text-xs h-8 font-semibold" onClick={() => { addToCart(p); toast.success(t('home.added', { name: p.name })); }}><ShoppingCart className="h-3 w-3 mr-1" /> {t('product.addToCart')}</Button>
                <Button size="sm" variant="ghost" className="rounded-lg h-8 w-8 p-0 text-destructive hover:bg-destructive/10" onClick={() => toggleWishlist(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
