import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Ticket, X, Check } from 'lucide-react';
import { useValidateVoucher } from '@/hooks/useSupabaseData';
import type { CartItem } from '@/data/store';
import { toast } from 'sonner';

interface AppliedVoucher {
  code: string;
  discountAmount: number;
}

interface VoucherInputProps {
  items: CartItem[];
  customerPhone?: string;
  userId?: string;
  applied: AppliedVoucher | null;
  onApply: (v: AppliedVoucher) => void;
  onClear: () => void;
  compact?: boolean;
}

export default function VoucherInput({
  items,
  customerPhone,
  userId,
  applied,
  onApply,
  onClear,
  compact,
}: VoucherInputProps) {
  const [code, setCode] = useState('');
  const validateMut = useValidateVoucher();

  const handleApply = async () => {
    const c = code.trim();
    if (!c) { toast.error('ভাউচার কোড দিন'); return; }
    if (items.length === 0) { toast.error('আগে কার্টে প্রোডাক্ট যোগ করুন'); return; }
    const res = await validateMut.mutateAsync({ code: c, items, customerPhone, userId });
    if (!res.valid || !res.discountAmount) {
      toast.error(res.error || 'ভাউচার ব্যবহার করা যাচ্ছে না');
      return;
    }
    onApply({ code: res.code || c.toUpperCase(), discountAmount: res.discountAmount });
    toast.success(`ভাউচার যুক্ত হলো — ৳${res.discountAmount} ছাড়`);
    setCode('');
  };

  if (applied) {
    return (
      <div className={`flex items-center justify-between gap-2 rounded-xl border-2 border-primary/30 bg-primary/5 ${compact ? 'p-2' : 'p-3'}`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Check className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className={`font-bold ${compact ? 'text-xs' : 'text-sm'} text-primary truncate`}>{applied.code}</p>
            <p className={`${compact ? 'text-[10px]' : 'text-xs'} text-muted-foreground`}>-৳{applied.discountAmount} ছাড়</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="p-1 rounded-md hover:bg-destructive/10 text-destructive shrink-0"
          aria-label="Remove voucher"
        >
          <X className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${compact ? '' : ''}`}>
      <div className="flex-1 relative">
        <Ticket className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-primary`} />
        <Input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="ভাউচার কোড"
          className={`${compact ? 'h-8 text-xs' : ''} pl-8 uppercase font-mono tracking-wider`}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleApply(); } }}
        />
      </div>
      <Button
        type="button"
        size={compact ? 'sm' : 'default'}
        onClick={handleApply}
        disabled={validateMut.isPending}
        className={compact ? 'h-8 text-xs' : ''}
      >
        {validateMut.isPending ? '...' : 'Apply'}
      </Button>
    </div>
  );
}