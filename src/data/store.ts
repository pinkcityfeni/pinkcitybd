// Shared data store — client-only state (cart, wishlist, POS cart)
// Server data (products, categories, banners, orders, reviews) now comes from Supabase via hooks
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types (kept for compatibility) ───

export interface Category {
  id: string;
  name: string;
  icon: string;
  image?: string | null;
  subcategories: string[];
  sort_order?: number;
}

export interface Product {
  id: string;
  name: string;
  image: string;
  images: string[];
  price: number;
  buyingPrice: number;
  barcode: string;
  stock: number;
  category: string;
  subcategory: string;
  description: string;
  trending?: boolean;
  source?: 'manual' | 'fb' | 'pos';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'bank' | 'cash';

export interface SplitPayment {
  method1: PaymentMethod;
  amount1: number;
  method2: PaymentMethod;
  amount2: number;
}

export type DeliveryZone = 'feni' | 'feni_upozila' | 'outside';

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  approved: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  type: 'online' | 'pos';
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

export interface Banner {
  id: string;
  image: string;
  title: string;
  link: string;
  active: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'cashier';
}

// ─── Helper to convert DB product to app Product ───
export function dbToProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    image: p.image || '',
    images: p.images || [],
    price: Number(p.price),
    buyingPrice: Number(p.buying_price),
    barcode: p.barcode || '',
    stock: p.stock || 0,
    category: p.category || '',
    subcategory: p.subcategory || '',
    description: p.description || '',
    trending: p.trending || false,
    source: (p.source as 'manual' | 'fb' | 'pos') || 'manual',
  };
}

export function dbToCategory(c: any): Category {
  return {
    id: c.id,
    name: c.name,
    icon: c.icon || '📦',
    image: c.image,
    subcategories: c.subcategories || [],
    sort_order: c.sort_order,
  };
}

export function dbToBanner(b: any): Banner {
  return {
    id: b.id,
    image: b.image || '',
    title: b.title || '',
    link: b.link || '/shop',
    active: b.active ?? true,
  };
}

export function dbToOrder(o: any): Order {
  return {
    id: o.id,
    items: (o.items as any[]) || [],
    total: Number(o.total),
    date: o.created_at,
    status: o.status,
    type: o.type,
    customerName: o.customer_name,
    customerEmail: o.customer_email,
    customerPhone: o.customer_phone,
    deliveryAddress: o.delivery_address,
    deliveryZone: o.delivery_zone as DeliveryZone,
    deliveryCharge: Number(o.delivery_charge || 0),
    paymentMethod: o.payment_method as PaymentMethod,
    paymentStatus: o.payment_status as 'pending' | 'paid',
    splitPayment: o.split_payment as SplitPayment | undefined,
    discount: Number(o.discount || 0),
    discountType: o.discount_type as 'fixed' | 'percent' | undefined,
  };
}

// ─── Client-only Store (cart, wishlist, POS) ───

interface ClientStoreState {
  cart: CartItem[];
  posCart: CartItem[];
  wishlist: string[];

  // Cart actions
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  buyNow: (product: Product, qty: number) => void;

  // POS Cart actions
  addToPosCart: (product: Product, qty?: number) => void;
  removeFromPosCart: (productId: string) => void;
  updatePosCartQty: (productId: string, qty: number) => void;
  clearPosCart: () => void;

  // Wishlist
  toggleWishlist: (productId: string) => void;
}

export const useStore = create<ClientStoreState>()(persist((set) => ({
  cart: [],
  posCart: [],
  wishlist: [],

  // ─── Cart ───
  addToCart: (product, qty = 1) => set(s => {
    const existing = s.cart.find(i => i.product.id === product.id);
    if (existing) return { cart: s.cart.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i) };
    return { cart: [...s.cart, { product, quantity: qty }] };
  }),
  removeFromCart: (id) => set(s => ({ cart: s.cart.filter(i => i.product.id !== id) })),
  updateCartQty: (id, qty) => set(s => ({ cart: s.cart.map(i => i.product.id === id ? { ...i, quantity: Math.max(1, qty) } : i) })),
  clearCart: () => set({ cart: [] }),
  buyNow: (product, qty) => set({ cart: [{ product, quantity: qty }] }),

  // ─── POS Cart ───
  addToPosCart: (product, qty = 1) => set(s => {
    const existing = s.posCart.find(i => i.product.id === product.id);
    if (existing) return { posCart: s.posCart.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i) };
    return { posCart: [...s.posCart, { product, quantity: qty }] };
  }),
  removeFromPosCart: (id) => set(s => ({ posCart: s.posCart.filter(i => i.product.id !== id) })),
  updatePosCartQty: (id, qty) => set(s => ({ posCart: s.posCart.map(i => i.product.id === id ? { ...i, quantity: Math.max(1, qty) } : i) })),
  clearPosCart: () => set({ posCart: [] }),

  // ─── Wishlist ───
  toggleWishlist: (productId) => set(s => ({
    wishlist: s.wishlist.includes(productId)
      ? s.wishlist.filter(id => id !== productId)
      : [...s.wishlist, productId],
  })),
}), { name: 'glamora-store' }));
