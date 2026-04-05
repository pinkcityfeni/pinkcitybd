import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/data/store';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowLeft, Package, Zap, Star, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams();
  const { products, categories, addToCart, buyNow } = useStore();
  const navigate = useNavigate();
  const product = products.find(p => p.id === id);
  const [qty, setQty] = useState(1);

  if (!product) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <p className="text-muted-foreground">Product not found</p>
      <Button asChild className="mt-4 rounded-full"><Link to="/shop">Back to Shop</Link></Button>
    </div>
  );

  const cat = categories.find(c => c.name === product.category);
  const related = products.filter(p => p.id !== product.id && p.subcategory === product.subcategory).slice(0, 4);

  const handleAddToCart = () => {
    if (qty > product.stock) { toast.error(`Only ${product.stock} in stock`); return; }
    addToCart(product, qty);
    toast.success(`Added ${qty}× ${product.name} to cart`);
  };

  const handleBuyNow = () => {
    if (qty > product.stock) { toast.error(`Only ${product.stock} in stock`); return; }
    buyNow(product, qty);
    navigate('/checkout');
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 animate-fade-in">
      <Link to="/shop" className="inline-flex items-center text-xs text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Shop
      </Link>

      <div className="grid md:grid-cols-2 gap-6 md:gap-10">
        {/* Image */}
        <div className="aspect-square rounded-3xl bg-muted/50 flex items-center justify-center overflow-hidden soft-gradient">
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-7xl md:text-8xl animate-float">{cat?.icon || '📦'}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex gap-2 mb-3">
            <Badge variant="secondary" className="rounded-full text-[10px] px-2.5">{product.category}</Badge>
            <Badge variant="outline" className="rounded-full text-[10px] px-2.5">{product.subcategory}</Badge>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">{product.description}</p>
          
          <p className="font-display text-3xl font-bold text-primary mb-2">${product.price.toFixed(2)}</p>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-1">
              <Package className="h-3.5 w-3.5" />
              {product.stock > 0 ? (
                <span className="text-success text-xs">{product.stock} in stock</span>
              ) : (
                <span className="text-destructive text-xs">Out of stock</span>
              )}
            </div>
            <span className="text-border">|</span>
            <div className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs">Earn {Math.floor(product.price * qty)} points</span>
            </div>
          </div>

          {/* Quantity + Actions */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-full overflow-hidden">
                <button className="px-3.5 py-2 hover:bg-muted text-sm transition-colors" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span className="px-2 py-2 min-w-[2.5rem] text-center font-medium text-sm">{qty}</span>
                <button className="px-3.5 py-2 hover:bg-muted text-sm transition-colors" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
              </div>
              <span className="text-sm text-muted-foreground">${(product.price * qty).toFixed(2)}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1 rounded-full h-11">
                <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
              </Button>
              <Button onClick={handleBuyNow} disabled={product.stock === 0} className="flex-1 rounded-full h-11 shadow-lg shadow-primary/20">
                <Zap className="h-4 w-4 mr-2" /> Buy Now
              </Button>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground mt-4">
            Barcode: <span className="font-mono">{product.barcode}</span>
          </p>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="font-display text-xl font-bold mb-5">You May Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {related.map(r => (
              <Link key={r.id} to={`/product/${r.id}`} className="group rounded-2xl border bg-card overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="aspect-square bg-muted/50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                  {r.image ? (
                    <img src={r.image} alt={r.name} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{cat?.icon || '📦'}</span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">{r.name}</h3>
                  <p className="font-display font-bold text-primary text-sm mt-0.5">${r.price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
