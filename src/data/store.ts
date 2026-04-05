// Shared data store for the entire application
import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  barcode: string;
  category: string;
  image: string;
  stock: number;
  unit: string;
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

const CATEGORIES = ['Electronics', 'Clothing', 'Food & Drinks', 'Home & Garden', 'Sports', 'Books'];

const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Wireless Earbuds Pro', description: 'Premium noise-cancelling wireless earbuds with 24h battery life.', price: 79.99, cost: 35, barcode: '1001', category: 'Electronics', image: '', stock: 45, unit: 'pcs' },
  { id: 'p2', name: 'Organic Green Tea', description: 'Hand-picked Japanese matcha green tea, 100g pack.', price: 14.50, cost: 6, barcode: '1002', category: 'Food & Drinks', image: '', stock: 120, unit: 'pcs' },
  { id: 'p3', name: 'Running Shoes X1', description: 'Lightweight performance running shoes with cushion sole.', price: 129.00, cost: 55, barcode: '1003', category: 'Sports', image: '', stock: 30, unit: 'pair' },
  { id: 'p4', name: 'Denim Jacket Classic', description: 'Timeless denim jacket, medium wash, relaxed fit.', price: 89.00, cost: 38, barcode: '1004', category: 'Clothing', image: '', stock: 22, unit: 'pcs' },
  { id: 'p5', name: 'Smart Desk Lamp', description: 'LED desk lamp with adjustable color temperature and brightness.', price: 49.99, cost: 18, barcode: '1005', category: 'Home & Garden', image: '', stock: 60, unit: 'pcs' },
  { id: 'p6', name: 'Bluetooth Speaker Mini', description: 'Portable waterproof speaker with 360° sound.', price: 39.99, cost: 15, barcode: '1006', category: 'Electronics', image: '', stock: 80, unit: 'pcs' },
  { id: 'p7', name: 'Yoga Mat Premium', description: 'Extra thick non-slip yoga mat, 6mm, eco-friendly.', price: 34.99, cost: 12, barcode: '1007', category: 'Sports', image: '', stock: 50, unit: 'pcs' },
  { id: 'p8', name: 'The Art of Code', description: 'Bestselling book on software craftsmanship.', price: 24.99, cost: 8, barcode: '1008', category: 'Books', image: '', stock: 90, unit: 'pcs' },
  { id: 'p9', name: 'Cotton T-Shirt Basic', description: '100% organic cotton crew neck tee, multiple colors.', price: 19.99, cost: 7, barcode: '1009', category: 'Clothing', image: '', stock: 200, unit: 'pcs' },
  { id: 'p10', name: 'Plant Pot Ceramic', description: 'Handmade ceramic plant pot with drainage hole, 15cm.', price: 22.00, cost: 9, barcode: '1010', category: 'Home & Garden', image: '', stock: 40, unit: 'pcs' },
  { id: 'p11', name: 'USB-C Hub 7-in-1', description: 'Multi-port adapter: HDMI, USB 3.0, SD card, PD charging.', price: 44.99, cost: 18, barcode: '1011', category: 'Electronics', image: '', stock: 65, unit: 'pcs' },
  { id: 'p12', name: 'Protein Energy Bar', description: 'Natural ingredients, 20g protein, box of 12.', price: 29.99, cost: 12, barcode: '1012', category: 'Food & Drinks', image: '', stock: 150, unit: 'box' },
];

const MOCK_ORDERS: Order[] = [
  { id: 'ord-001', items: [{ product: MOCK_PRODUCTS[0], quantity: 2 }], total: 159.98, date: '2026-04-04T10:30:00', status: 'completed', type: 'online', customerName: 'Alice Chen', customerEmail: 'alice@email.com' },
  { id: 'ord-002', items: [{ product: MOCK_PRODUCTS[2], quantity: 1 }, { product: MOCK_PRODUCTS[6], quantity: 1 }], total: 163.99, date: '2026-04-04T14:15:00', status: 'processing', type: 'online', customerName: 'Bob Smith' },
  { id: 'ord-003', items: [{ product: MOCK_PRODUCTS[1], quantity: 3 }, { product: MOCK_PRODUCTS[4], quantity: 1 }], total: 93.49, date: '2026-04-05T09:00:00', status: 'pending', type: 'pos' },
  { id: 'ord-004', items: [{ product: MOCK_PRODUCTS[8], quantity: 5 }], total: 99.95, date: '2026-04-03T16:45:00', status: 'completed', type: 'pos' },
  { id: 'ord-005', items: [{ product: MOCK_PRODUCTS[3], quantity: 1 }], total: 89.00, date: '2026-04-02T11:20:00', status: 'completed', type: 'online', customerName: 'Carol Davis' },
];

interface StoreState {
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  posCart: CartItem[];
  categories: string[];
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
}

export const useStore = create<StoreState>((set, get) => ({
  products: MOCK_PRODUCTS,
  orders: MOCK_ORDERS,
  cart: [],
  posCart: [],
  categories: CATEGORIES,

  addToCart: (product, qty = 1) => set(s => {
    const existing = s.cart.find(i => i.product.id === product.id);
    if (existing) return { cart: s.cart.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i) };
    return { cart: [...s.cart, { product, quantity: qty }] };
  }),
  removeFromCart: (id) => set(s => ({ cart: s.cart.filter(i => i.product.id !== id) })),
  updateCartQty: (id, qty) => set(s => ({ cart: s.cart.map(i => i.product.id === id ? { ...i, quantity: Math.max(1, qty) } : i) })),
  clearCart: () => set({ cart: [] }),

  addToPosCart: (product, qty = 1) => set(s => {
    const existing = s.posCart.find(i => i.product.id === product.id);
    if (existing) return { posCart: s.posCart.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i) };
    return { posCart: [...s.posCart, { product, quantity: qty }] };
  }),
  removeFromPosCart: (id) => set(s => ({ posCart: s.posCart.filter(i => i.product.id !== id) })),
  updatePosCartQty: (id, qty) => set(s => ({ posCart: s.posCart.map(i => i.product.id === id ? { ...i, quantity: Math.max(1, qty) } : i) })),
  clearPosCart: () => set({ posCart: [] }),

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
  updateStock: (productId, change) => set(s => ({ products: s.products.map(p => p.id === productId ? { ...p, stock: Math.max(0, p.stock + change) } : p) })),
  addProduct: (product) => set(s => ({ products: [...s.products, { ...product, id: `p${Date.now()}` }] })),
  updateProduct: (id, updates) => set(s => ({ products: s.products.map(p => p.id === id ? { ...p, ...updates } : p) })),
  deleteProduct: (id) => set(s => ({ products: s.products.filter(p => p.id !== id) })),
}));
