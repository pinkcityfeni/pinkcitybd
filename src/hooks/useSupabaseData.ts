import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { dbToProduct, dbToCategory, dbToBanner, dbToOrder, dbToBrand } from '@/data/store';
import type { Product, Category, Banner, Order, Review, PaymentMethod, SplitPayment, DeliveryZone, CartItem, Brand } from '@/data/store';

// ─── Brands ───
export function useBrands() {
  const queryKey = ['brands'];
  useRealtimeSubscription('brands', queryKey);
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase.from('brands' as any).select('*').order('sort_order');
      if (error) throw error;
      return ((data as any[]) || []).map(dbToBrand);
    },
  });
}

export function useDefaultBrand(): Brand | undefined {
  const { data: brands = [] } = useBrands();
  return brands.find(b => b.isDefault) || brands[0];
}

export function useAddBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (brand: { name: string; slug: string; color?: string }) => {
      const { error } = await supabase.from('brands' as any).insert({
        name: brand.name,
        slug: brand.slug,
        color: brand.color || '#ec4899',
      } as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['brands'] }),
  });
}

export function useUpdateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Brand> }) => {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.sortOrder !== undefined) dbUpdates.sort_order = updates.sortOrder;
      const { error } = await supabase.from('brands' as any).update(dbUpdates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['brands'] }),
  });
}

export function useDeleteBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('brands' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brands'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// ─── Realtime subscription helper ───
function useRealtimeSubscription(tableName: string, queryKey: string[]) {
  const queryClient = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel(`${tableName}-realtime-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, () => {
        queryClient.invalidateQueries({ queryKey });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [tableName, queryClient]);
}

// ─── Products (admin/cashier — includes buyingPrice) ───
export function useProducts() {
  const queryKey = ['products'];
  useRealtimeSubscription('products', queryKey);
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(dbToProduct);
    },
  });
}

// ─── Public Products (store-facing — excludes buyingPrice) ───
export function usePublicProducts() {
  const queryKey = ['products_public'];
  useRealtimeSubscription('products', queryKey);
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase.from('products_public' as any).select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((p: any): Product => ({
        id: p.id,
        name: p.name,
        image: p.image || '',
        images: p.images || [],
        price: Number(p.price),
        compareAtPrice: Number(p.compare_at_price || 0),
        buyingPrice: 0,
        barcode: p.barcode || '',
        stock: p.stock || 0,
        category: p.category || '',
        subcategory: p.subcategory || '',
        description: p.description || '',
        trending: p.trending || false,
      }));
    },
  });
}

export function useAddProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: Omit<Product, 'id'>) => {
      const { error } = await supabase.from('products').insert({
        name: product.name, description: product.description, image: product.image,
        images: product.images, price: product.price, buying_price: product.buyingPrice,
        compare_at_price: product.compareAtPrice || 0,
        barcode: product.barcode, stock: product.stock, category: product.category,
        subcategory: product.subcategory, trending: product.trending || false,
        source: product.source || 'manual',
        brand_id: product.brandId,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Product> }) => {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.image !== undefined) dbUpdates.image = updates.image;
      if (updates.images !== undefined) dbUpdates.images = updates.images;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.compareAtPrice !== undefined) dbUpdates.compare_at_price = updates.compareAtPrice;
      if (updates.buyingPrice !== undefined) dbUpdates.buying_price = updates.buyingPrice;
      if (updates.barcode !== undefined) dbUpdates.barcode = updates.barcode;
      if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.subcategory !== undefined) dbUpdates.subcategory = updates.subcategory;
      if (updates.trending !== undefined) dbUpdates.trending = updates.trending;
      if (updates.brandId !== undefined) dbUpdates.brand_id = updates.brandId;
      const { error } = await supabase.from('products').update(dbUpdates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, change }: { productId: string; change: number }) => {
      const { data: product } = await supabase.from('products').select('stock').eq('id', productId).single();
      if (!product) throw new Error('Product not found');
      const newStock = Math.max(0, product.stock + change);
      const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', productId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

// ─── Categories ───
export function useCategories() {
  const queryKey = ['categories'];
  useRealtimeSubscription('categories', queryKey);
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('sort_order');
      if (error) throw error;
      return (data || []).map(dbToCategory);
    },
  });
}

export function useAddCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cat: { name: string; icon?: string; image?: string; subcategories?: string[]; brandId: string }) => {
      const { error } = await supabase.from('categories').insert({
        name: cat.name, icon: cat.icon || '📦', image: cat.image,
        subcategories: cat.subcategories || [],
        brand_id: cat.brandId,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Category> }) => {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
      if (updates.image !== undefined) dbUpdates.image = updates.image;
      if (updates.subcategories !== undefined) dbUpdates.subcategories = updates.subcategories;
      if (updates.sort_order !== undefined) dbUpdates.sort_order = updates.sort_order;
      if (updates.brandId !== undefined) dbUpdates.brand_id = updates.brandId;
      const { error } = await supabase.from('categories').update(dbUpdates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

// ─── Banners ───
export function useBanners() {
  const queryKey = ['banners'];
  useRealtimeSubscription('banners', queryKey);
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase.from('banners').select('*').order('sort_order');
      if (error) throw error;
      return (data || []).map(dbToBanner);
    },
  });
}

export function useAddBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (banner: { image: string; title: string; link: string; active: boolean }) => {
      const { error } = await supabase.from('banners').insert(banner);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['banners'] }),
  });
}

export function useUpdateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Banner> }) => {
      const { error } = await supabase.from('banners').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['banners'] }),
  });
}

export function useDeleteBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('banners').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['banners'] }),
  });
}

// ─── Reviews ───
export function useReviews(productId?: string) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (productId) query = query.eq('product_id', productId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((r: any): Review => ({
        id: r.id, productId: r.product_id, customerName: r.customer_name,
        rating: r.rating, comment: r.comment, date: r.created_at,
        approved: r.approved ?? false,
      }));
    },
  });
}

export function useAddReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (review: { productId: string; customerName: string; rating: number; comment: string }) => {
      const { error } = await supabase.from('reviews').insert({
        product_id: review.productId, customer_name: review.customerName,
        rating: review.rating, comment: review.comment,
      } as any);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['reviews'] });
      qc.invalidateQueries({ queryKey: ['reviews', vars.productId] });
    },
  });
}

export function useApproveReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const { error } = await supabase.from('reviews').update({ approved } as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  });
}

// ─── Orders ───
export function useOrders() {
  const queryKey = ['orders'];
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(dbToOrder);
    },
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: Order['status'] }) => {
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}

interface PlaceOrderData {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  deliveryZone?: DeliveryZone;
  deliveryCharge?: number;
  paymentMethod?: PaymentMethod;
  paymentStatus?: 'pending' | 'paid';
  splitPayment?: SplitPayment;
  discount?: number;
  discountType?: 'fixed' | 'percent';
  redeemPoints?: number;
}

export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ type, items, data }: { type: 'online' | 'pos'; items: CartItem[]; data?: PlaceOrderData }) => {
      const { data: result, error } = await supabase.functions.invoke('place-order', {
        body: { type, items, data },
      });

      if (error) {
        // Try to extract message from error
        const msg = typeof error === 'object' && error !== null && 'message' in error
          ? (error as any).message
          : typeof error === 'string' ? error : 'Order failed';
        throw new Error(msg);
      }

      // result may be a string if response wasn't auto-parsed
      let parsed = result;
      if (typeof result === 'string') {
        try { parsed = JSON.parse(result); } catch { throw new Error('Invalid response'); }
      }

      if (!parsed?.id) throw new Error('Order failed');

      return {
        id: parsed.id as string,
        total: Number(parsed.total || 0),
        pointsEarned: Number(parsed.pointsEarned || 0),
        pointsRedeemed: Number(parsed.pointsRedeemed || 0),
      };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['customer_points'] });
    },
  });
}

// ─── App Settings ───
export function useAppSettings() {
  const queryKey = ['app_settings'];
  useRealtimeSubscription('app_settings', queryKey);
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase.from('app_settings').select('*');
      if (error) throw error;
      const map: Record<string, string> = {};
      (data || []).forEach((s: any) => { map[s.key] = s.value; });
      return map;
    },
  });
}

export function useUpdateAppSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase.from('app_settings').upsert({ key, value });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['app_settings'] }),
  });
}

// ─── Product Rating Helper ───
export function useProductRating(productId: string) {
  const { data: reviews } = useReviews(productId);
  if (!reviews || reviews.length === 0) return { avg: 0, count: 0 };
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return { avg, count: reviews.length };
}

// ─── Image Upload ───
export async function uploadImage(file: File, path?: string): Promise<string> {
  const ext = file.name.split('.').pop();
  const filePath = path || `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('images').upload(filePath, file);
  if (error) throw error;
  const { data } = supabase.storage.from('images').getPublicUrl(filePath);
  return data.publicUrl;
}

// ─── Reward Points ───
export interface CustomerPoints {
  id: string;
  user_id: string | null;
  phone: string;
  name: string;
  points: number;
  total_earned: number;
  total_redeemed: number;
}

export function normalizePhone(p: string): string {
  return (p || '').replace(/\D/g, '');
}

// Current user's points (for Account/Checkout)
export function useMyPoints(userId?: string | null) {
  return useQuery({
    queryKey: ['customer_points', 'me', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_points' as any)
        .select('*')
        .eq('user_id', userId!)
        .maybeSingle();
      if (error) throw error;
      return (data as any) as CustomerPoints | null;
    },
  });
}

// Lookup customer by phone (POS)
export function useFindCustomerByPhone() {
  return useMutation({
    mutationFn: async (phone: string): Promise<CustomerPoints | null> => {
      const norm = normalizePhone(phone);
      if (!norm) return null;
      const { data, error } = await supabase
        .from('customer_points' as any)
        .select('*')
        .eq('phone', norm)
        .maybeSingle();
      if (error) throw error;
      return (data as any) as CustomerPoints | null;
    },
  });
}

// Admin: list all customer points
export function useAllCustomerPoints() {
  const queryKey = ['customer_points', 'all'];
  useRealtimeSubscription('customer_points', queryKey);
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_points' as any)
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return ((data as any[]) || []) as CustomerPoints[];
    },
  });
}

// Admin: manual points adjustment
export function useAdjustPoints() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ customerId, delta, note }: { customerId: string; delta: number; note?: string }) => {
      const { data: cp, error: e1 } = await supabase
        .from('customer_points' as any).select('*').eq('id', customerId).single();
      if (e1) throw e1;
      const cur = cp as any;
      const newPoints = Math.max(0, (cur.points || 0) + delta);
      const { error: e2 } = await supabase
        .from('customer_points' as any)
        .update({ points: newPoints })
        .eq('id', customerId);
      if (e2) throw e2;
      await supabase.from('point_transactions' as any).insert({
        customer_id: customerId, type: 'adjust', points: delta, note: note || 'Manual adjustment',
      } as any);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customer_points'] }),
  });
}

// Admin: create new customer + grant points (any phone)
export function useCreateOrGrantCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ phone, name, points, note }: { phone: string; name?: string; points: number; note?: string }) => {
      const norm = normalizePhone(phone);
      if (!norm) throw new Error('সঠিক ফোন নাম্বার দিন');
      if (!Number.isFinite(points) || points <= 0) throw new Error('পয়েন্ট ১ বা তার বেশি দিন');

      const { data: existing } = await supabase
        .from('customer_points' as any)
        .select('*')
        .eq('phone', norm)
        .maybeSingle();

      let cpId: string;
      if (existing) {
        const cur = existing as any;
        const { error } = await supabase
          .from('customer_points' as any)
          .update({
            points: (cur.points || 0) + points,
            total_earned: (cur.total_earned || 0) + points,
            name: cur.name || name || '',
          })
          .eq('id', cur.id);
        if (error) throw error;
        cpId = cur.id;
      } else {
        const { data: created, error } = await supabase
          .from('customer_points' as any)
          .insert({ phone: norm, name: name || '', points, total_earned: points } as any)
          .select('id')
          .single();
        if (error) throw error;
        cpId = (created as any).id;
      }

      await supabase.from('point_transactions' as any).insert({
        customer_id: cpId, type: 'adjust', points, note: note || 'Admin granted',
      } as any);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customer_points'] }),
  });
}

// User's transactions
export function useMyPointTransactions(customerId?: string | null) {
  return useQuery({
    queryKey: ['point_transactions', customerId],
    enabled: !!customerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('point_transactions' as any)
        .select('*')
        .eq('customer_id', customerId!)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data as any[]) || [];
    },
  });
}

// ─── POS Returns ───
export interface PosReturn {
  id: string;
  order_id: string;
  items: { product_id: string; name: string; price: number; quantity: number }[];
  total_refund: number;
  refund_method: string;
  reason: string;
  points_reverted: number;
  processed_by: string | null;
  created_at: string;
}

export function useReturns() {
  const queryKey = ['pos_returns'];
  useRealtimeSubscription('pos_returns', queryKey);
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pos_returns' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return ((data as any[]) || []) as PosReturn[];
    },
  });
}

export function useProcessReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      order_id: string;
      items: { product_id: string; quantity: number }[];
      refund_method: string;
      reason?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('process-return', {
        body: payload,
      });
      if (error) {
        const msg = typeof error === 'object' && error !== null && 'message' in error
          ? (error as any).message : 'Return failed';
        throw new Error(msg);
      }
      let parsed = data;
      if (typeof data === 'string') {
        try { parsed = JSON.parse(data); } catch { throw new Error('Invalid response'); }
      }
      if (parsed?.error) throw new Error(parsed.error);
      return parsed as { id: string; total_refund: number; points_reverted: number; status: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['pos_returns'] });
      qc.invalidateQueries({ queryKey: ['customer_points'] });
    },
  });
}
