import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/data/store';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowLeft, Package, Zap } from 'lucide-react';
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
      <Button asChild className="mt-4"><Link to="/shop">Back to Shop</Link></Button>
    </div>
  );

  const cat = categories.find(c => c.name === product.category);
  const related = products.filter(p => p.id !== product.id && p.subcategory === product.subcategory).slice(0, 4);

  const handleAddToCart = () => {
    if (qty > product.stock) {
      toast.error(`Only ${product.stock} in stock`);
      return;
    }
    addToCart(product, qty);
    toast.success(`Added ${qty}× ${product.name} to cart`);
  };

  const handleBuyNow = () => {
    if (qty > product.stock) {
      toast.error(`Only ${product.stock} in stock`);
      return;
    }
    buyNow(product, qty);
    navigate('/checkout');
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <Link to="/shop" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Shop
      </Link>
      <div className="grid md:grid-cols-2 gap-10">
        <div className="aspect-square rounded-2xl bg-muted flex items-center justify-center overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-8xl">{cat?.icon || '📦'}</span>
          )}
        </div>
        <div className="flex flex-col">
          <div className="flex gap-2 mb-2">
            <Badge variant="secondary">{product.category}</Badge>
            <Badge variant="outline">{product.subcategory}</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-muted-foreground mb-4">{product.description}</p>
          <p className="text-3xl font-bold text-primary mb-4">${product.price.toFixed(2)}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Package className="h-4 w-4" />
            {product.stock > 0 ? <span className="text-success">{product.stock} in stock</span> : <span className="text-destructive">Out of stock</span>}
          </div>

          {/* Quantity + Actions */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-lg">
                <button className="px-3 py-2 hover:bg-muted" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span className="px-3 py-2 min-w-[3rem] text-center font-medium">{qty}</span>
                <button className="px-3 py-2 hover:bg-muted" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
              </div>
              <span className="text-sm text-muted-foreground">
                ${(product.price * qty).toFixed(2)}
              </span>
            </div>
            <div className="flex gap-3">
              <Button size="lg" variant="outline" onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1">
                <ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart
              </Button>
              <Button size="lg" onClick={handleBuyNow} disabled={product.stock === 0} className="flex-1">
                <Zap className="h-5 w-5 mr-2" /> Buy Now
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Earn <span className="font-semibold text-accent">{Math.floor(product.price * qty)}</span> reward points with this purchase
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Barcode: <span className="font-mono">{product.barcode}</span>
          </p>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="font-bold text-lg mb-4">More in {product.subcategory}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map(r => (
              <Link key={r.id} to={`/product/${r.id}`} className="stat-card group">
                <div className="aspect-square rounded-lg bg-muted flex items-center justify-center mb-2 overflow-hidden">
                  {r.image ? (
                    <img src={r.image} alt={r.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-3xl">{cat?.icon || '📦'}</span>
                  )}
                </div>
                <h3 className="text-sm font-medium line-clamp-1 group-hover:text-primary">{r.name}</h3>
                <p className="text-sm font-bold text-primary">${r.price.toFixed(2)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
