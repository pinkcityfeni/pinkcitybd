import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/data/store';
import { useProducts, useCategories, useReviews, useAddReview, useProductRating } from '@/hooks/useSupabaseData';
import { useLanguage } from '@/data/language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, ArrowLeft, Package, Zap, Star, Heart, Send, Truck, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

function StarRating({ rating, size = 'sm', interactive = false, onChange }: { rating: number; size?: 'sm' | 'md' | 'lg'; interactive?: boolean; onChange?: (r: number) => void }) {
  const cls = size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-5 w-5' : 'h-3.5 w-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} onClick={() => interactive && onChange?.(s)} className={interactive ? 'cursor-pointer hover:scale-125 transition-transform' : 'cursor-default'}>
          <Star className={`${cls} transition-colors ${s <= rating ? 'fill-warning text-warning' : 'text-border'}`} />
        </button>
      ))}
    </div>
  );
}

function ProductImageGallery({ product, cat }: { product: { image: string; images?: string[]; name: string }; cat?: { icon: string } }) {
  const allImages = (product.images && product.images.length > 0) ? product.images : (product.image ? [product.image] : []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartRef = useRef(0);
  const touchEndRef = useRef(0);

  const goTo = useCallback((idx: number) => {
    setCurrentIndex(Math.max(0, Math.min(allImages.length - 1, idx)));
  }, [allImages.length]);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartRef.current = e.touches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndRef.current = e.touches[0].clientX; };
  const handleTouchEnd = () => {
    const diff = touchStartRef.current - touchEndRef.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < allImages.length - 1) goTo(currentIndex + 1);
      else if (diff < 0 && currentIndex > 0) goTo(currentIndex - 1);
    }
  };

  if (allImages.length === 0) {
    return (
      <div className="aspect-square rounded-xl overflow-hidden bg-secondary/30 flex items-center justify-center border">
        <span className="text-8xl">{cat?.icon || '📦'}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="aspect-square rounded-xl overflow-hidden bg-secondary/30 border relative select-none" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        <img src={allImages[currentIndex]} alt={`${product.name} ${currentIndex + 1}`} className="h-full w-full object-cover transition-opacity duration-300" draggable={false} />
        {allImages.length > 1 && (
          <>
            {currentIndex > 0 && <button onClick={() => goTo(currentIndex - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-background transition-colors"><ChevronLeft className="h-4 w-4" /></button>}
            {currentIndex < allImages.length - 1 && <button onClick={() => goTo(currentIndex + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-background transition-colors"><ChevronRight className="h-4 w-4" /></button>}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {allImages.map((_, i) => <button key={i} onClick={() => goTo(i)} className={`h-1.5 rounded-full transition-all ${i === currentIndex ? 'w-4 bg-primary' : 'w-1.5 bg-background/60'}`} />)}
            </div>
          </>
        )}
      </div>
      {allImages.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {allImages.map((img, i) => <button key={i} onClick={() => goTo(i)} className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === currentIndex ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}><img src={img} alt="" className="w-full h-full object-cover" /></button>)}
        </div>
      )}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const addToCart = useStore(s => s.addToCart);
  const buyNow = useStore(s => s.buyNow);
  const wishlist = useStore(s => s.wishlist);
  const toggleWishlist = useStore(s => s.toggleWishlist);
  const { data: reviews = [] } = useReviews(id);
  const addReviewMut = useAddReview();
  const rating = useProductRating(id || '');
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const product = products.find(p => p.id === id);
  const [qty, setQty] = useState(1);
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  if (!product) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <p className="text-6xl mb-4">💔</p>
      <p className="text-muted-foreground text-lg">{t('product.notFound')}</p>
      <Button asChild className="mt-6 rounded-lg px-8"><Link to="/shop">{t('product.backToShop')}</Link></Button>
    </div>
  );

  const cat = categories.find(c => c.name === product.category);
  const related = products.filter(p => p.id !== product.id && p.subcategory === product.subcategory).slice(0, 4);
  const isWished = wishlist.includes(product.id);
  const productReviews = reviews;

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
    addReviewMut.mutate({ productId: product.id, customerName: reviewName, rating: reviewRating, comment: reviewComment });
    toast.success(t('product.reviewSubmitted'));
    setReviewName(''); setReviewComment(''); setReviewRating(5);
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: productReviews.filter(r => r.rating === star).length,
    percent: productReviews.length > 0 ? (productReviews.filter(r => r.rating === star).length / productReviews.length) * 100 : 0,
  }));

  return (
    <div className="animate-fade-in">
      <div className="container mx-auto px-4 pt-4 pb-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">{t('nav.home')}</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-foreground transition-colors">{t('nav.shop')}</Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
          <div className="relative">
            <ProductImageGallery product={product} cat={cat} />
            <button onClick={() => toggleWishlist(product.id)} className={`absolute top-4 right-4 z-10 h-10 w-10 rounded-lg backdrop-blur-md flex items-center justify-center shadow-sm transition-all ${isWished ? 'bg-destructive text-white' : 'bg-background/80 text-muted-foreground hover:text-destructive'}`}>
              <Heart className={`h-5 w-5 ${isWished ? 'fill-white' : ''}`} />
            </button>
            {product.stock <= 5 && product.stock > 0 && (
              <Badge className="absolute top-4 left-4 z-10 bg-destructive text-destructive-foreground rounded text-[10px]">
                {lang === 'bn' ? `মাত্র ${product.stock}টি বাকি` : `Only ${product.stock} left`}
              </Badge>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap gap-1.5 mb-2">
              <Badge variant="secondary" className="rounded text-[10px] px-2.5 py-0.5">{product.category}</Badge>
              <Badge variant="outline" className="rounded text-[10px] px-2.5 py-0.5">{product.subcategory}</Badge>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-2 leading-tight">{product.name}</h1>
            {rating.count > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <StarRating rating={Math.round(rating.avg)} size="sm" />
                <span className="text-sm text-muted-foreground">{rating.avg.toFixed(1)} · {t('product.reviews', { n: rating.count })}</span>
              </div>
            )}
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">{product.description}</p>
            <div className="mb-4"><p className="text-3xl font-bold text-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>৳{product.price.toFixed(0)}</p></div>
            <div className="flex items-center gap-2 mb-5">
              <Package className="h-4 w-4 text-muted-foreground" />
              {product.stock > 0 ? <span className="text-sm text-success font-medium">{t('product.inStock', { n: product.stock })}</span> : <span className="text-sm text-destructive font-medium">{t('home.outOfStock')}</span>}
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button className="px-3.5 py-2 hover:bg-muted text-sm font-bold transition-colors" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span className="px-4 py-2 min-w-[3rem] text-center font-semibold text-sm border-x">{qty}</span>
                <button className="px-3.5 py-2 hover:bg-muted text-sm font-bold transition-colors" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
              </div>
              <p className="text-sm text-muted-foreground">= <span className="font-bold text-foreground">৳{(product.price * qty).toFixed(0)}</span></p>
            </div>
            <div className="flex gap-3 mb-6">
              <Button variant="outline" onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1 rounded-lg h-11 font-semibold"><ShoppingCart className="h-4 w-4 mr-2" /> {t('product.addToCart')}</Button>
              <Button onClick={handleBuyNow} disabled={product.stock === 0} className="flex-1 rounded-lg h-11 font-semibold"><Zap className="h-4 w-4 mr-2" /> {t('product.buyNow')}</Button>
            </div>
            <div className="grid grid-cols-2 gap-3 border rounded-lg p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Truck className="h-4 w-4 text-primary shrink-0" /><span>{lang === 'bn' ? 'দ্রুত ডেলিভারি' : 'Fast Delivery'}</span></div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-primary shrink-0" /><span>{lang === 'bn' ? 'অরিজিনাল' : 'Original'}</span></div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-4 font-mono">{t('product.barcode')}: {product.barcode}</p>
          </div>
        </div>
      </div>

      <div className="bg-secondary/30 py-10">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-xl font-bold mb-6">{t('product.reviewRating')}</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
            <div className="rounded-xl border bg-background p-5">
              {rating.count > 0 ? (
                <div className="space-y-4">
                  <div className="text-center mb-3">
                    <p className="text-4xl font-bold" style={{ fontFamily: 'DM Sans, sans-serif' }}>{rating.avg.toFixed(1)}</p>
                    <StarRating rating={Math.round(rating.avg)} size="md" />
                    <p className="text-xs text-muted-foreground mt-1">{t('product.reviews', { n: rating.count })}</p>
                  </div>
                  <div className="space-y-1.5">
                    {ratingDistribution.map(d => (
                      <div key={d.star} className="flex items-center gap-2 text-sm">
                        <span className="w-3 text-xs text-muted-foreground">{d.star}</span>
                        <Star className="h-3 w-3 fill-warning text-warning" />
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-warning transition-all" style={{ width: `${d.percent}%` }} /></div>
                        <span className="w-5 text-right text-xs text-muted-foreground">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8"><p className="text-3xl mb-2">💬</p><p className="text-sm text-muted-foreground">{t('product.noReviews')}</p></div>
              )}
            </div>
            <div className="rounded-xl border bg-background p-5 space-y-3">
              <h3 className="font-semibold text-sm">{t('product.writeReview')}</h3>
              <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Rating:</span><StarRating rating={reviewRating} size="md" interactive onChange={setReviewRating} /></div>
              <Input value={reviewName} onChange={e => setReviewName(e.target.value)} placeholder={t('product.yourName')} className="rounded-lg" />
              <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder={t('product.yourReview')} className="flex w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary min-h-[80px] resize-none" />
              <Button onClick={handleSubmitReview} className="rounded-lg w-full h-10 font-semibold"><Send className="h-4 w-4 mr-2" /> {t('product.submit')}</Button>
            </div>
          </div>

          {productReviews.length > 0 && (
            <div className="max-w-4xl mt-6 space-y-2">
              {productReviews.map(r => (
                <div key={r.id} className="rounded-xl border bg-background p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{r.customerName.charAt(0).toUpperCase()}</div>
                      <div><span className="font-medium text-sm">{r.customerName}</span><div className="flex items-center gap-0.5 mt-0.5"><StarRating rating={r.rating} size="sm" /></div></div>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{new Date(r.date).toLocaleDateString('bn-BD')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-[42px]">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="container mx-auto px-4 py-10">
          <h2 className="font-display text-xl font-bold mb-5">{t('product.youMayLike')}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {related.map(r => (
              <Link key={r.id} to={`/product/${r.id}`} className="group product-card">
                <div className="aspect-square bg-secondary/30 flex items-center justify-center overflow-hidden">
                  {r.image ? <img src={r.image} alt={r.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" /> : <span className="text-4xl">{cat?.icon || '📦'}</span>}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">{r.name}</h3>
                  <p className="font-bold text-sm mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>৳{r.price.toFixed(0)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
