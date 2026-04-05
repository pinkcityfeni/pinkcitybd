import { useParams, Link } from 'react-router-dom';
import { useStore } from '@/data/store';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowLeft, Package } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

const EMOJI_MAP: Record<string, string> = {
  'Electronics': '🔌', 'Clothing': '👕', 'Food & Drinks': '🍵',
  'Home & Garden': '🌿', 'Sports': '🏃', 'Books': '📚',
};

export default function ProductDetail() {
  const { id } = useParams();
  const { products, addToCart } = useStore();
  const product = products.find(p => p.id === id);
  const [qty, setQty] = useState(1);

  if (!product) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <p className="text-muted-foreground">Product not found</p>
      <Button asChild className="mt-4"><Link to="/shop">Back to Shop</Link></Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <Link to="/shop" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Shop
      </Link>
      <div className="grid md:grid-cols-2 gap-10">
        <div className="aspect-square rounded-2xl bg-muted flex items-center justify-center">
          <span className="text-8xl">{EMOJI_MAP[product.category] || '📦'}</span>
        </div>
        <div className="flex flex-col">
          <Badge variant="secondary" className="w-fit mb-2">{product.category}</Badge>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-muted-foreground mb-4">{product.description}</p>
          <p className="text-3xl font-bold text-primary mb-4">${product.price.toFixed(2)}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Package className="h-4 w-4" />
            {product.stock > 0 ? <span className="text-success">{product.stock} in stock</span> : <span className="text-destructive">Out of stock</span>}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center border rounded-lg">
              <button className="px-3 py-2 hover:bg-muted" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span className="px-3 py-2 min-w-[3rem] text-center font-medium">{qty}</span>
              <button className="px-3 py-2 hover:bg-muted" onClick={() => setQty(q => q + 1)}>+</button>
            </div>
            <Button size="lg" onClick={() => addToCart(product, qty)} disabled={product.stock === 0} className="flex-1">
              <ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Earn <span className="font-semibold text-accent">{Math.floor(product.price)}</span> reward points with this purchase
          </p>
        </div>
      </div>
    </div>
  );
}
