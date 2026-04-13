import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import type { Tables } from '@/integrations/supabase/types';

export type DbProduct = Tables<'products'>;
export type DbCategory = Tables<'categories'>;
export type DbBanner = Tables<'banners'>;
export type DbReview = Tables<'reviews'>;
export type DbOrder = Tables<'orders'>;

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

// ─── Products ───
export function useProducts() {
  const queryKey = ['products'];
  useRealtimeSubscription('products', queryKey);
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as DbProduct[];
    },
  });
}

export function useAddProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: Omit<DbProduct, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('products').insert(product).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DbProduct> }) => {
      const { error } = await supabase.from('products').update(updates).eq('id', id);
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

// ─── Categories ───
export function useCategories() {
  const queryKey = ['categories'];
  useRealtimeSubscription('categories', queryKey);
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('sort_order');
      if (error) throw error;
      return data as DbCategory[];
    },
  });
}

export function useAddCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cat: { name: string; icon?: string; image?: string; subcategories?: string[] }) => {
      const { data, error } = await supabase.from('categories').insert({
        name: cat.name,
        icon: cat.icon || '📦',
        image: cat.image,
        subcategories: cat.subcategories || [],
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DbCategory> }) => {
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
      return data as DbBanner[];
    },
  });
}

export function useAddBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (banner: { image: string; title: string; link: string; active: boolean }) => {
      const { data, error } = await supabase.from('banners').insert(banner).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['banners'] }),
  });
}

export function useUpdateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DbBanner> }) => {
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
      return data as DbReview[];
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
      return data as DbOrder[];
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
      return data as { key: string; value: string }[];
    },
  });
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
