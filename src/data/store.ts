// Shared data store for the entire application
import { create } from 'zustand';

// ─── Types ───

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
}

export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  buyingPrice: number;
  barcode: string;
  stock: number;
  category: string;
  subcategory: string;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
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
}

export interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  role: 'customer' | 'admin' | 'cashier';
}

// ─── Seed Data ───

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Jewelry', icon: '💍', subcategories: ['Necklace', 'Churi', 'Ring'] },
  { id: 'cat-2', name: 'Cosmetics', icon: '💄', subcategories: ['Lipstick', 'Cream'] },
];

const INITIAL_PRODUCTS: Product[] = [
  // Jewelry — Necklace
  { id: 'p1', name: 'Gold Layered Necklace', image: '', price: 49.99, buyingPrice: 22, barcode: '2001', stock: 35, category: 'Jewelry', subcategory: 'Necklace', description: 'Elegant multi-layer gold-plated necklace, adjustable chain length.' },
  { id: 'p2', name: 'Pearl Pendant Necklace', image: '', price: 39.99, buyingPrice: 16, barcode: '2002', stock: 50, category: 'Jewelry', subcategory: 'Necklace', description: 'Classic freshwater pearl pendant on a sterling silver chain.' },
  { id: 'p3', name: 'Silver Statement Necklace', image: '', price: 59.99, buyingPrice: 28, barcode: '2003', stock: 20, category: 'Jewelry', subcategory: 'Necklace', description: 'Bold silver-tone statement necklace for special occasions.' },
  // Jewelry — Churi
  { id: 'p4', name: 'Traditional Glass Churi Set', image: '', price: 12.99, buyingPrice: 4, barcode: '2004', stock: 100, category: 'Jewelry', subcategory: 'Churi', description: 'Set of 12 colorful glass bangles, assorted colors.' },
  { id: 'p5', name: 'Gold Plated Churi Set', image: '', price: 24.99, buyingPrice: 10, barcode: '2005', stock: 60, category: 'Jewelry', subcategory: 'Churi', description: 'Premium gold-plated bangle set of 6, intricate design.' },
  { id: 'p6', name: 'Crystal Churi Pair', image: '', price: 18.50, buyingPrice: 7, barcode: '2006', stock: 45, category: 'Jewelry', subcategory: 'Churi', description: 'Sparkling crystal-studded bangle pair, one size fits most.' },
  // Jewelry — Ring
  { id: 'p7', name: 'Diamond Solitaire Ring', image: '', price: 129.99, buyingPrice: 55, barcode: '2007', stock: 15, category: 'Jewelry', subcategory: 'Ring', description: 'Stunning CZ diamond solitaire ring in white gold setting.' },
  { id: 'p8', name: 'Stacking Ring Set', image: '', price: 29.99, buyingPrice: 12, barcode: '2008', stock: 40, category: 'Jewelry', subcategory: 'Ring', description: 'Set of 5 minimalist stacking rings, mixed metals.' },
  { id: 'p9', name: 'Vintage Emerald Ring', image: '', price: 79.99, buyingPrice: 35, barcode: '2009', stock: 18, category: 'Jewelry', subcategory: 'Ring', description: 'Vintage-style emerald green stone ring with filigree band.' },
  // Cosmetics — Lipstick
  { id: 'p10', name: 'Matte Velvet Lipstick', image: '', price: 14.99, buyingPrice: 5, barcode: '3001', stock: 120, category: 'Cosmetics', subcategory: 'Lipstick', description: 'Long-lasting matte finish lipstick, rich pigmentation.' },
  { id: 'p11', name: 'Glossy Lip Color', image: '', price: 11.99, buyingPrice: 4, barcode: '3002', stock: 90, category: 'Cosmetics', subcategory: 'Lipstick', description: 'High-shine glossy lip color with moisturizing formula.' },
  { id: 'p12', name: 'Liquid Lipstick Pro', image: '', price: 18.99, buyingPrice: 7, barcode: '3003', stock: 75, category: 'Cosmetics', subcategory: 'Lipstick', description: 'Professional-grade liquid lipstick, 12-hour wear.' },
  // Cosmetics — Cream
  { id: 'p13', name: 'Hydrating Face Cream', image: '', price: 24.99, buyingPrice: 9, barcode: '3004', stock: 85, category: 'Cosmetics', subcategory: 'Cream', description: 'Deep hydrating face cream with hyaluronic acid and vitamin E.' },
  { id: 'p14', name: 'Night Repair Cream', image: '', price: 34.99, buyingPrice: 14, barcode: '3005', stock: 55, category: 'Cosmetics', subcategory: 'Cream', description: 'Intensive overnight repair cream with retinol and collagen.' },
  { id: 'p15', name: 'SPF50 Sunscreen Cream', image: '', price: 19.99, buyingPrice: 8, barcode: '3006', stock: 100, category: 'Cosmetics', subcategory: 'Cream', description: 'Broad-spectrum SPF50 sunscreen, lightweight, non-greasy.' },
];

const INITIAL_ORDERS: Order[] = [
  { id: 'ord-001', items: [{ product: INITIAL_PRODUCTS[0], quantity: 2 }], total: 99.98, date: '2026-04-04T10:30:00', status: 'completed', type: 'online', customerName: 'Fatima Akter', customerEmail: 'fatima@email.com' },
  { id: 'ord-002', items: [{ product: INITIAL_PRODUCTS[9], quantity: 3 }, { product: INITIAL_PRODUCTS[12], quantity: 1 }], total: 69.96, date: '2026-04-04T14:15:00', status: 'processing', type: 'online', customerName: 'Nusrat Jahan' },
  { id: 'ord-003', items: [{ product: INITIAL_PRODUCTS[3], quantity: 5 }], total: 64.95, date: '2026-04-05T09:00:00', status: 'pending', type: 'pos' },
  { id: 'ord-004', items: [{ product: INITIAL_PRODUCTS[6], quantity: 1 }], total: 129.99, date: '2026-04-03T16:45:00', status: 'completed', type: 'pos' },
  { id: 'ord-005', items: [{ product: INITIAL_PRODUCTS[13], quantity: 2 }], total: 69.98, date: '2026-04-02T11:20:00', status: 'completed', type: 'online', customerName: 'Rashida Begum' },
];

// ─── Store ───

interface StoreState {
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  posCart: CartItem[];
  categories: Category[];

  // Category actions
  addCategory: (name: string, icon?: string) => void;
  updateCategory: (id: string, updates: Partial<Omit<Category, 'id'>>) => void;
  deleteCategory: (id: string) => void;
  addSubcategory: (categoryId: string, subcategory: string) => void;
  removeSubcategory: (categoryId: string, subcategory: string) => void;

  // Cart actions
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;

  // POS Cart actions
  addToPosCart: (product: Product, qty?: number) => void;
  removeFromPosCart: (productId: string) => void;
  updatePosCartQty: (productId: string, qty: number) => void;
  clearPosCart: () => void;

  // Order actions
  placeOrder: (type: 'online' | 'pos', customerName?: string, customerEmail?: string) => string;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  // Product actions
  updateStock: (productId: string, change: number) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Helpers
  getCategoryNames: () => string[];
  getSubcategories: (categoryName: string) => string[];
}

export const useStore = create<StoreState>((set, get) => ({
  products: INITIAL_PRODUCTS,
  orders: INITIAL_ORDERS,
  cart: [],
  posCart: [],
  categories: INITIAL_CATEGORIES,

  // ─── Category actions ───
  addCategory: (name, icon = '📦') => set(s => ({
    categories: [...s.categories, { id: `cat-${Date.now()}`, name, icon, subcategories: [] }],
  })),
  updateCategory: (id, updates) => set(s => ({
    categories: s.categories.map(c => c.id === id ? { ...c, ...updates } : c),
  })),
  deleteCategory: (id) => set(s => ({
    categories: s.categories.filter(c => c.id !== id),
  })),
  addSubcategory: (categoryId, subcategory) => set(s => ({
    categories: s.categories.map(c =>
      c.id === categoryId && !c.subcategories.includes(subcategory)
        ? { ...c, subcategories: [...c.subcategories, subcategory] }
        : c
    ),
  })),
  removeSubcategory: (categoryId, subcategory) => set(s => ({
    categories: s.categories.map(c =>
      c.id === categoryId
        ? { ...c, subcategories: c.subcategories.filter(sc => sc !== subcategory) }
        : c
    ),
  })),

  // ─── Cart ───
  addToCart: (product, qty = 1) => set(s => {
    const existing = s.cart.find(i => i.product.id === product.id);
    if (existing) return { cart: s.cart.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i) };
    return { cart: [...s.cart, { product, quantity: qty }] };
  }),
  removeFromCart: (id) => set(s => ({ cart: s.cart.filter(i => i.product.id !== id) })),
  updateCartQty: (id, qty) => set(s => ({ cart: s.cart.map(i => i.product.id === id ? { ...i, quantity: Math.max(1, qty) } : i) })),
  clearCart: () => set({ cart: [] }),

  // ─── POS Cart ───
  addToPosCart: (product, qty = 1) => set(s => {
    const existing = s.posCart.find(i => i.product.id === product.id);
    if (existing) return { posCart: s.posCart.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i) };
    return { posCart: [...s.posCart, { product, quantity: qty }] };
  }),
  removeFromPosCart: (id) => set(s => ({ posCart: s.posCart.filter(i => i.product.id !== id) })),
  updatePosCartQty: (id, qty) => set(s => ({ posCart: s.posCart.map(i => i.product.id === id ? { ...i, quantity: Math.max(1, qty) } : i) })),
  clearPosCart: () => set({ posCart: [] }),

  // ─── Orders ───
  placeOrder: (type, customerName, customerEmail) => {
    const s = get();
    const items = type === 'pos' ? s.posCart : s.cart;
    const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const id = `ord-${Date.now()}`;
    const order: Order = { id, items: [...items], total, date: new Date().toISOString(), status: 'pending', type, customerName, customerEmail };
    set(state => ({
      orders: [order, ...state.orders],
      ...(type === 'pos' ? { posCart: [] } : { cart: [] }),
      products: state.products.map(p => {
        const item = items.find(i => i.product.id === p.id);
        return item ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p;
      }),
    }));
    return id;
  },
  updateOrderStatus: (orderId, status) => set(s => ({ orders: s.orders.map(o => o.id === orderId ? { ...o, status } : o) })),

  // ─── Products ───
  updateStock: (productId, change) => set(s => ({ products: s.products.map(p => p.id === productId ? { ...p, stock: Math.max(0, p.stock + change) } : p) })),
  addProduct: (product) => set(s => ({ products: [...s.products, { ...product, id: `p${Date.now()}` }] })),
  updateProduct: (id, updates) => set(s => ({ products: s.products.map(p => p.id === id ? { ...p, ...updates } : p) })),
  deleteProduct: (id) => set(s => ({ products: s.products.filter(p => p.id !== id) })),

  // ─── Helpers ───
  getCategoryNames: () => get().categories.map(c => c.name),
  getSubcategories: (categoryName) => {
    const cat = get().categories.find(c => c.name === categoryName);
    return cat ? cat.subcategories : [];
  },
}));
