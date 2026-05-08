import { cn } from '@/lib/utils';

interface PriceTagProps {
  price: number;
  compareAt?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showBadge?: boolean;
}

const sizeMap = {
  sm: { price: 'text-sm', compare: 'text-[10px]', badge: 'text-[9px] px-1.5 py-0' },
  md: { price: 'text-base', compare: 'text-xs', badge: 'text-[10px] px-2 py-0.5' },
  lg: { price: 'text-3xl', compare: 'text-base', badge: 'text-xs px-2 py-0.5' },
};

export function PriceTag({ price, compareAt, size = 'md', className, showBadge = true }: PriceTagProps) {
  const hasDiscount = !!compareAt && compareAt > price;
  const pct = hasDiscount ? Math.round(((compareAt! - price) / compareAt!) * 100) : 0;
  const s = sizeMap[size];

  return (
    <div className={cn('flex items-center gap-1.5 flex-wrap', className)} style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <span className={cn('font-bold text-primary', s.price)}>Tk {price.toFixed(0)}</span>
      {hasDiscount && (
        <>
          <span className={cn('text-muted-foreground line-through', s.compare)}>Tk {compareAt!.toFixed(0)}</span>
          {showBadge && (
            <span className={cn('inline-flex items-center rounded-full bg-destructive/10 text-destructive font-semibold', s.badge)}>
              −{pct}%
            </span>
          )}
        </>
      )}
    </div>
  );
}

// Small corner ribbon for product cards
export function SaleBadge({ price, compareAt, className }: { price: number; compareAt?: number; className?: string }) {
  if (!compareAt || compareAt <= price) return null;
  const pct = Math.round(((compareAt - price) / compareAt) * 100);
  return (
    <div className={cn('absolute top-2 left-2 z-10 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 shadow-md', className)} style={{ fontFamily: 'DM Sans, sans-serif' }}>
      −{pct}%
    </div>
  );
}