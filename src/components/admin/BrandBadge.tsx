import type { Brand } from '@/data/store';

export function BrandBadge({ brand, size = 'sm' }: { brand?: Brand | null; size?: 'xs' | 'sm' | 'md' }) {
  if (!brand) return null;
  const sizeClass = size === 'xs' ? 'text-[9px] px-1.5 py-0' : size === 'md' ? 'text-xs px-2.5 py-1' : 'text-[10px] px-2 py-0.5';
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold text-white ${sizeClass}`}
      style={{ backgroundColor: brand.color }}
    >
      {brand.name}
    </span>
  );
}