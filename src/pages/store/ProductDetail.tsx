import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/data/store';
import { useLanguage } from '@/data/language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, ArrowLeft, Package, Zap, Star, Sparkles, Heart, Send } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams();
  const { products, categories, addToCart, buyNow, wishlist, toggleWishlist, reviews, addReview, getProductRating } = useStore();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const product = products.find(p => p.id === id);
  const [qty, setQty] = useState(1);
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  if (!product) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <p className="text-muted-foreground">{t('product.notFound')}</p>
      <Button asChild className="mt-4 rounded-full"><Link to="/shop">{t('product.backToShop')}</Link></Button>
    </div>
  );

  const cat = categories.find(c => c.name === product.category);
  const related = products.filter(p => p.id !== product.id && p.subcategory === product.subcategory).slice(0, 4);
  const isWished = wishlist.includes(product.id);
  const productReviews = reviews.filter(r => r.productId === product.id);
  const rating = getProductRating(product.id);

  const handleAddToCart = () => {
    if (qty > product.stock) { toast.error(t('product.stockLimitError', { n: product.stock })); return; }
    addToCart(product, qty);
    toast.success(t('product.addedToCart', { qty, name: product.name }));
  };

  const handleBuyNow = () => {
    if (qty > product.stock) { toast.error(t('product.stockLimitError', { n: product.stock })); return; }
    buyNow(product, qty);
    navigate('/checkout');
  };

  const handleSubmitReview = () => {
    if (!reviewName.trim()) { toast.error(t('product.enterName')); return; }
    if (!reviewComment.trim()) { toast.error(t('product.enterReview')); return; }
    addReview({ productId: product.id, customerName: reviewName, rating: reviewRating, comment: reviewComment });
    toast.success(t('product.reviewSubmitted'));
    setReviewName('');
    setReviewComment('');
    setReviewRating(5);
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 animate-fade-in">
      <Link to="/shop" className="inline-flex items-center text-xs text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5 mr-1" /> {t('product.backToShop')}
      </Link>

      <div className="grid md:grid-cols-2 gap-6 md:gap-10">
        <div className="aspect-square rounded-3xl bg-muted/50 flex items-center justify-center overflow-hidden soft-gradient relative">
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-7xl md:text-8xl animate-float">{cat?.icon || '📦'}</span>
          )}
          <button
            onClick={() => toggleWishlist(product.id)}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          >
            <Heart className={`h-5 w-5 ${isWished ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
          </button>
        </div>

        <div className="flex flex-col">
          <div className="flex gap-2 mb-3">
            <Badge variant="secondary" className="rounded-full text-[10px] px-2.5">{product.category}</Badge>
            <Badge variant="outline" className="rounded-full text-[10px] px-2.5">{product.subcategory}</Badge>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">{product.description}</p>

          {rating.count > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className={`h-4 w-4 ${s <= Math.round(rating.avg) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({rating.avg.toFixed(1)}) · {t('product.reviews', { n: rating.count })}</span>
            </div>
          )}

          <p className="font-display text-3xl font-bold text-primary mb-2">৳{product.price.toFixed(0)}</p>

          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-1">
              <Package className="h-3.5 w-3.5" />
              {product.stock > 0 ? (
                <span className="text-success text-xs">{t('product.inStock', { n: product.stock })}</span>
              ) : (
                <span className="text-destructive text-xs">{t('home.outOfStock')}</span>
              )}
            </div>
            <span className="text-border">|</span>
            <div className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs">{t('product.earnPoints', { n: Math.floor(product.price * qty) })}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-full overflow-hidden">
                <button className="px-3.5 py-2 hover:bg-muted text-sm transition-colors" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span className="px-2 py-2 min-w-[2.5rem] text-center font-medium text-sm">{qty}</span>
                <button className="px-3.5 py-2 hover:bg-muted text-sm transition-colors" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
              </div>
              <span className="text-sm text-muted-foreground">৳{(product.price * qty).toFixed(0)}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1 rounded-full h-11">
                <ShoppingCart className="h-4 w-4 mr-2" /> {t('product.addToCart')}
              </Button>
              <Button onClick={handleBuyNow} disabled={product.stock === 0} className="flex-1 rounded-full h-11 shadow-lg shadow-primary/20">
                <Zap className="h-4 w-4 mr-2" /> {t('product.buyNow')}
              </Button>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground mt-4">
            {t('product.barcode')}: <span className="font-mono">{product.barcode}</span>
          </p>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-14">
        <h2 className="font-display text-xl font-bold mb-5">{t('product.reviewRating')}</h2>

        <div className="rounded-2xl border bg-card p-4 mb-6 space-y-3">
          <h3 className="font-semibold text-sm">{t('product.writeReview')}</h3>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} onClick={() => setReviewRating(s)}>
                <Star className={`h-5 w-5 ${s <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
              </button>
            ))}
          </div>
          <Input value={reviewName} onChange={e => setReviewName(e.target.value)} placeholder={t('product.yourName')} />
          <textarea
            value={reviewComment}
            onChange={e => setReviewComment(e.target.value)}
            placeholder={t('product.yourReview')}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[60px] resize-none"
          />
          <Button size="sm" onClick={handleSubmitReview} className="rounded-full">
            <Send className="h-3.5 w-3.5 mr-1.5" /> {t('product.submit')}
          </Button>
        </div>

        {productReviews.length > 0 ? (
          <div className="space-y-3">
            {productReviews.map(r => (
              <div key={r.id} className="rounded-xl border bg-card p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{r.customerName}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(r.date).toLocaleDateString('bn-BD')}</span>
                </div>
                <div className="flex items-center gap-0.5 mb-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`h-3 w-3 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{r.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t('product.noReviews')}</p>
        )}
      </div>

      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="font-display text-xl font-bold mb-5">{t('product.youMayLike')}</h2>
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
                  <p className="font-display font-bold text-primary text-sm mt-0.5">৳{r.price.toFixed(0)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
