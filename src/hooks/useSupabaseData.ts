import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { dbToProduct, dbToCategory, dbToBanner, dbToOrder } from '@/data/store';
import type { Product, Category, Banner, Order, Review, PaymentMethod, SplitPayment, DeliveryZone, CartItem } from '@/data/store';

// ─── Realtime subscription helper ───
function useRealtimeSubscription(tableName: string, queryKey: string[]) {
  const queryClient = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel(`${tableName}-realtime`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, () => {
        queryClient.invalidateQueries({ queryKey });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [tableName, queryClient, queryKey]);
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
        barcode: product.barcode, stock: product.stock, category: product.category,
        subcategory: product.subcategory, trending: product.trending || false,
      });
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
      if (updates.buyingPrice !== undefined) dbUpdates.buying_price = updates.buyingPrice;
      if (updates.barcode !== undefined) dbUpdates.barcode = updates.barcode;
      if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.subcategory !== undefined) dbUpdates.subcategory = updates.subcategory;
      if (updates.trending !== undefined) dbUpdates.trending = updates.trending;
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
    mutationFn: async (cat: { name: string; icon?: string; image?: string; subcategories?: string[] }) => {
      const { error } = await supabase.from('categories').insert({
        name: cat.name, icon: cat.icon || '📦', image: cat.image,
        subcategories: cat.subcategories || [],
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Category> }) => {
      const { error } = await supabase.from('categories').update(updates).eq('id', id);
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
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['reviews'] });
      qc.invalidateQueries({ queryKey: ['reviews', vars.productId] });
    },
  });
}

// ─── Orders ───
export function useOrders() {
  const queryKey = ['orders'];
  useRealtimeSubscription('orders', queryKey);
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(dbToOrder);
    },
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
}

export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ type, items, data }: { type: 'online' | 'pos'; items: CartItem[]; data?: PlaceOrderData }) => {
      const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
      const deliveryCharge = data?.deliveryCharge || 0;
      const discountAmount = data?.discount
        ? (data.discountType === 'percent' ? Math.round(subtotal * data.discount / 100) : data.discount)
        : 0;
      const total = Math.max(0, subtotal - discountAmount) + deliveryCharge;

      const orderItems = items.map(i => ({
        product: { id: i.product.id, name: i.product.name, price: i.product.price, buyingPrice: i.product.buyingPrice, barcode: i.product.barcode, image: i.product.image },
        quantity: i.quantity,
      }));

      const { data: orderData, error } = await supabase.from('orders').insert({
        items: orderItems as any,
        total,
        status: 'pending',
        type,
        customer_name: data?.customerName || (type === 'pos' ? 'Walk-in Customer' : 'Guest'),
        customer_email: data?.customerEmail,
        customer_phone: data?.customerPhone,
        delivery_address: data?.deliveryAddress,
        delivery_zone: data?.deliveryZone,
        delivery_charge: deliveryCharge,
        payment_method: data?.paymentMethod,
        payment_status: data?.paymentStatus || (data?.paymentMethod === 'cod' ? 'pending' : 'paid'),
        split_payment: data?.splitPayment as any,
        discount: data?.discount || 0,
        discount_type: data?.discountType,
      }).select().single();

      if (error) throw error;

      // Update stock for each item
      for (const item of items) {
        const { data: prod } = await supabase.from('products').select('stock').eq('id', item.product.id).single();
        if (prod) {
          await supabase.from('products').update({ stock: Math.max(0, prod.stock - item.quantity) }).eq('id', item.product.id);
        }
      }

      return { id: orderData.id, total };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['products'] });
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
