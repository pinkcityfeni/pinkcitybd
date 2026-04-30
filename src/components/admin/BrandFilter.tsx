import { Button } from '@/components/ui/button';
import { useBrands } from '@/hooks/useSupabaseData';

interface BrandFilterProps {
  value: string;
  onChange: (brandId: string) => void;
  showAll?: boolean;
  allLabel?: string;
}

export function BrandFilter({ value, onChange, showAll = true, allLabel = 'All Brands' }: BrandFilterProps) {
  const { data: brands = [] } = useBrands();
  return (
    <div className="flex gap-1.5 flex-wrap">
      {showAll && (
        <Button
          variant={!value ? 'default' : 'outline'}
          size="sm"
          className="rounded-lg text-xs h-8"
          onClick={() => onChange('')}
        >
          {allLabel}
        </Button>
      )}
      {brands.map(b => {
        const active = value === b.id;
        return (
          <Button
            key={b.id}
            variant={active ? 'default' : 'outline'}
            size="sm"
            className="rounded-lg text-xs h-8 gap-1.5"
            onClick={() => onChange(b.id)}
            style={active ? { backgroundColor: b.color, borderColor: b.color, color: 'white' } : { borderColor: b.color + '40' }}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: b.color }} />
            {b.name}
          </Button>
        );
      })}
    </div>
  );
}