import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/data/store';
import { useLanguage } from '@/data/language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, ArrowLeft, Package, Zap, Star, Sparkles, Heart, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

function StarRating({ rating, size = 'sm', interactive = false, onChange }: { rating: number; size?: 'sm' | 'md' | 'lg'; interactive?: boolean; onChange?: (r: number) => void }) {
  const cls = size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-5 w-5' : 'h-3.5 w-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} onClick={() => interactive && onChange?.(s)} className={interactive ? 'cursor-pointer hover:scale-125 transition-transform' : 'cursor-default'}>
          <Star className={`${cls} transition-colors ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/20'}`} />
        </button>
      ))}
    </div>
  );
}

function RelatedProductCard({ product, catIcon }: { product: any; catIcon: string }) {
  const rating = useStore(s => s.getProductRating)(product.id);
  return (
    <Link to={`/product/${product.id}`} className="group rounded-2xl border bg-card overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="aspect-square bg-gradient-to-br from-secondary/50 to-muted/30 flex items-center justify-center overflow-hidden relative">
        {product.image ? (
          <img src={product.image} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{catIcon}</span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
        {rating.count > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <StarRating rating={Math.round(rating.avg)} size="sm" />
            <span className="text-[10px] text-muted-foreground">({rating.count})</span>
          </div>
        )}
        <p className="font-display font-bold text-primary text-sm mt-1">৳{product.price.toFixed(0)}</p>
      </div>
    </Link>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const products = useStore(s => s.products);
  const categories = useStore(s => s.categories);
  const addToCart = useStore(s => s.addToCart);
  const buyNow = useStore(s => s.buyNow);
  const wishlist = useStore(s => s.wishlist);
  const toggleWishlist = useStore(s => s.toggleWishlist);
  const reviews = useStore(s => s.reviews);
  const addReview = useStore(s => s.addReview);
  const getProductRating = useStore(s => s.getProductRating);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const product = products.find(p => p.id === id);
  const [qty, setQty] = useState(1);
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [imgZoomed, setImgZoomed] = useState(false);

  if (!product) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="max-w-md mx-auto">
        <div className="text-6xl mb-4">💔</div>
        <p className="text-muted-foreground text-lg">{t('product.notFound')}</p>
        <Button asChild className="mt-6 rounded-full px-8"><Link to="/shop">{t('product.backToShop')}</Link></Button>
      </div>
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

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: productReviews.filter(r => r.rating === star).length,
    percent: productReviews.length > 0 ? (productReviews.filter(r => r.rating === star).length / productReviews.length) * 100 : 0,
  }));

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 pt-4 pb-2">
        <Link to="/shop" className="inline-flex items-center text-xs text-muted-foreground hover:text-primary transition-colors group">
          <ArrowLeft className="h-3.5 w-3.5 mr-1 group-hover:-translate-x-1 transition-transform" /> {t('product.backToShop')}
        </Link>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pb-8">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-12">
          {/* Image */}
          <div className="relative group">
            <div
              className={`aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-secondary/60 via-muted/30 to-accent/10 flex items-center justify-center cursor-zoom-in shadow-lg transition-all duration-500 ${imgZoomed ? 'scale-[1.02] shadow-2xl' : ''}`}
              onClick={() => setImgZoomed(z => !z)}
            >
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className={`h-full w-full object-cover transition-transform duration-700 ${imgZoomed ? 'scale-125' : 'group-hover:scale-105'}`}
                />
              ) : (
                <span className="text-8xl md:text-9xl animate-float">{cat?.icon || '📦'}</span>
              )}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/10 via-transparent to-white/5 pointer-events-none" />
            </div>

            {/* Wishlist Button */}
            <button
              onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
              className={`absolute top-4 right-4 h-12 w-12 rounded-full backdrop-blur-md flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 ${isWished ? 'bg-destructive/90 text-white' : 'bg-card/80 text-muted-foreground hover:text-destructive'}`}
            >
              <Heart className={`h-5 w-5 transition-all ${isWished ? 'fill-white scale-110' : ''}`} />
            </button>

            {/* Stock Badge */}
            {product.stock <= 5 && product.stock > 0 && (
              <Badge className="absolute top-4 left-4 bg-warning text-warning-foreground rounded-full text-[10px] animate-pulse">
                🔥 Only {product.stock} left!
              </Badge>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary" className="rounded-full text-[10px] px-3 py-1 bg-secondary/80">{product.category}</Badge>
              <Badge variant="outline" className="rounded-full text-[10px] px-3 py-1 border-primary/20 text-primary">{product.subcategory}</Badge>
            </div>

            <h1 className="font-display text-2xl md:text-4xl font-bold mb-3 leading-tight">{product.name}</h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-5">{product.description}</p>

            {/* Rating Summary */}
            {rating.count > 0 && (
              <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl bg-secondary/30 w-fit">
                <div className="flex items-center gap-1">
                  <StarRating rating={Math.round(rating.avg)} size="md" />
                </div>
                <div className="text-sm">
                  <span className="font-bold text-foreground">{rating.avg.toFixed(1)}</span>
                  <span className="text-muted-foreground ml-1">· {t('product.reviews', { n: rating.count })}</span>
                </div>
              </div>
            )}

            {/* Price */}
            <div className="mb-5">
              <p className="font-display text-4xl font-bold text-primary">
                ৳{product.price.toFixed(0)}
              </p>
            </div>

            {/* Stock & Points */}
            <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50">
                <Package className="h-4 w-4 text-primary" />
                {product.stock > 0 ? (
                  <span className="text-success font-medium text-xs">{t('product.inStock', { n: product.stock })}</span>
                ) : (
                  <span className="text-destructive font-medium text-xs">{t('home.outOfStock')}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-xs font-medium text-accent">{t('product.earnPoints', { n: Math.floor(product.price * qty) })}</span>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-primary/20 rounded-full overflow-hidden bg-card">
                  <button className="px-4 py-2.5 hover:bg-primary/10 text-sm font-bold transition-colors text-primary" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                  <span className="px-3 py-2.5 min-w-[3rem] text-center font-bold text-sm">{qty}</span>
                  <button className="px-4 py-2.5 hover:bg-primary/10 text-sm font-bold transition-colors text-primary" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-display font-bold text-lg text-primary">৳{(product.price * qty).toFixed(0)}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 rounded-full h-12 border-2 border-primary/30 hover:bg-primary/5 hover:border-primary text-primary font-semibold transition-all"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" /> {t('product.addToCart')}
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 rounded-full h-12 shadow-lg shadow-primary/25 font-semibold bg-gradient-to-r from-primary to-accent hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  <Zap className="h-4 w-4 mr-2" /> {t('product.buyNow')}
                </Button>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground mt-5 font-mono">
              {t('product.barcode')}: {product.barcode}
            </p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-secondary/20 py-12 mt-6">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl font-bold mb-8 text-center">
            ✨ {t('product.reviewRating')}
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Rating Overview */}
            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              {rating.count > 0 ? (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <p className="font-display text-5xl font-bold text-primary">{rating.avg.toFixed(1)}</p>
                    <StarRating rating={Math.round(rating.avg)} size="lg" />
                    <p className="text-sm text-muted-foreground mt-1">{t('product.reviews', { n: rating.count })}</p>
                  </div>
                  <div className="space-y-2">
                    {ratingDistribution.map(d => (
                      <div key={d.star} className="flex items-center gap-2 text-sm">
                        <span className="w-3 text-muted-foreground">{d.star}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300 transition-all duration-500" style={{ width: `${d.percent}%` }} />
                        </div>
                        <span className="w-6 text-right text-muted-foreground text-xs">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-4xl mb-2">💬</p>
                  <p className="text-sm text-muted-foreground">{t('product.noReviews')}</p>
                </div>
              )}
            </div>

            {/* Write Review */}
            <div className="rounded-3xl border bg-card p-6 shadow-sm space-y-4">
              <h3 className="font-display font-semibold text-lg">{t('product.writeReview')}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rating:</span>
                <StarRating rating={reviewRating} size="lg" interactive onChange={setReviewRating} />
              </div>
              <Input
                value={reviewName}
                onChange={e => setReviewName(e.target.value)}
                placeholder={t('product.yourName')}
                className="rounded-xl border-primary/20 focus:border-primary"
              />
              <textarea
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                placeholder={t('product.yourReview')}
                className="flex w-full rounded-xl border-2 border-primary/10 bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring min-h-[80px] resize-none transition-colors"
              />
              <Button onClick={handleSubmitReview} className="rounded-full w-full h-11 bg-gradient-to-r from-primary to-accent shadow-md">
                <Send className="h-4 w-4 mr-2" /> {t('product.submit')}
              </Button>
            </div>
          </div>

          {/* Review List */}
          {productReviews.length > 0 && (
            <div className="max-w-5xl mx-auto mt-8 space-y-3">
              {productReviews.map((r, i) => (
                <div key={r.id} className="rounded-2xl border bg-card p-4 hover:shadow-md transition-shadow animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                        {r.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-sm">{r.customerName}</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <StarRating rating={r.rating} size="sm" />
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                      {new Date(r.date).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-12">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="font-display text-2xl font-bold mb-6 text-center">
            💖 {t('product.youMayLike')}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map(r => (
              <RelatedProductCard key={r.id} product={r} catIcon={cat?.icon || '📦'} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
