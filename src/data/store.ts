// Shared data store for the entire application
import { create } from 'zustand';

// ─── Types ───

export interface Category {
  id: string;
  name: string;
  icon: string;
  image?: string;
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

export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'card' | 'bank' | 'cash';

export interface SplitPayment {
  method1: PaymentMethod;
  amount1: number;
  method2: PaymentMethod;
  amount2: number;
}

export type DeliveryZone = 'feni' | 'outside';

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
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
  pointsEarned?: number;
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
  points: number;
  role: 'customer' | 'admin' | 'cashier';
}

// ─── Seed Data ───

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Jewelry', icon: '💍', subcategories: ['Necklace', 'Churi', 'Ring', 'Earring', 'Bracelet', 'Anklet'] },
  { id: 'cat-2', name: 'Skin', icon: '✨', subcategories: ['Cleanser', 'Face Wash', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen', 'Face Mask', 'Acne Treatment', 'Eye Cream', 'Night Cream', 'Lip Care'] },
  { id: 'cat-3', name: 'Health & Hygiene', icon: '🧴', subcategories: ['Sanitizer', 'Feminine Hygiene', 'Deodorant', 'Cotton & Tissue', 'Hand Wash', 'Dettol & Savlon'] },
  { id: 'cat-4', name: 'Body', icon: '🛁', subcategories: ['Body Wash', 'Body Scrub & Exfoliator', 'Body Wax', 'Body Sun Protection', 'Lotion & Oil', 'Hand & Foot Care', 'Body Cream', 'Body Butter'] },
  { id: 'cat-5', name: 'Hair', icon: '💇', subcategories: ['Shampoo', 'Hair Serum', 'Conditioner', 'Hair Mask & Cream', 'Hair Oil', 'Hair Color', 'Hair Spray'] },
  { id: 'cat-6', name: 'Mom & Baby', icon: '👶', subcategories: ['Baby Cream & Moisturizers', 'Baby Shampoo', 'Baby Body Wash', 'Baby Lotion & Oil', 'Baby Powder', 'Stretch Mark', 'Baby Sunscreen', 'Baby Wipes', 'Baby Toothpaste'] },
  { id: 'cat-7', name: 'Oral Care', icon: '🦷', subcategories: ['Toothpaste', 'Tooth Brush', 'Mouthwash'] },
  { id: 'cat-8', name: 'Makeup', icon: '💄', subcategories: ['Loose Powder', 'Blush', 'Foundation', 'Concealer', 'Lip Tint', 'Setting Spray', 'Highlighter', 'Compact Powder', 'Primer', 'Mascara', 'Contour & Bronzer', 'BB & CC Cream', 'Makeup Remover', 'Eyeliner', 'Eyeshadow', 'Lipstick', 'Lip Liner', 'Lip Gloss', 'Nail Polish', 'Makeup Brushes & Sponge', 'Face Palette'] },
  { id: 'cat-9', name: 'Fragrance', icon: '🌸', subcategories: ["Women's Perfume", "Women's Body Mist", "Men's Body Spray", "Women's Body Spray", "Men's Perfume", "Women's Roll Ons", "Men's Roll Ons"] },
  { id: 'cat-10', name: 'Men', icon: '🧔', subcategories: ['Facewash & Scrub', "Men's Shampoo", "Men's Conditioner", 'Hair Gel', 'Hair Oil', 'Razor', 'Shaving Cream', 'Aftershave Lotion'] },
  { id: 'cat-11', name: 'Accessories', icon: '🎀', subcategories: ['Bath Sponge & Loofah', 'Hair Accessories', 'Makeup Bag', 'Mirror'] },
  { id: 'cat-12', name: 'Supplement', icon: '💊', subcategories: ['Vitamins', 'Collagen', 'Protein', 'Health Drink'] },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Gold Layered Necklace', image: '', price: 2500, buyingPrice: 1100, barcode: '2001', stock: 35, category: 'Jewelry', subcategory: 'Necklace', description: 'Elegant multi-layer gold-plated necklace, adjustable chain length.' },
  { id: 'p2', name: 'Pearl Pendant Necklace', image: '', price: 1800, buyingPrice: 800, barcode: '2002', stock: 50, category: 'Jewelry', subcategory: 'Necklace', description: 'Classic freshwater pearl pendant on a sterling silver chain.' },
  { id: 'p3', name: 'Silver Statement Necklace', image: '', price: 3200, buyingPrice: 1400, barcode: '2003', stock: 20, category: 'Jewelry', subcategory: 'Necklace', description: 'Bold silver-tone statement necklace for special occasions.' },
  { id: 'p4', name: 'Traditional Glass Churi Set', image: '', price: 350, buyingPrice: 120, barcode: '2004', stock: 100, category: 'Jewelry', subcategory: 'Churi', description: 'Set of 12 colorful glass bangles, assorted colors.' },
  { id: 'p5', name: 'Gold Plated Churi Set', image: '', price: 1200, buyingPrice: 500, barcode: '2005', stock: 60, category: 'Jewelry', subcategory: 'Churi', description: 'Premium gold-plated bangle set of 6, intricate design.' },
  { id: 'p6', name: 'Crystal Churi Pair', image: '', price: 850, buyingPrice: 350, barcode: '2006', stock: 45, category: 'Jewelry', subcategory: 'Churi', description: 'Sparkling crystal-studded bangle pair, one size fits most.' },
  { id: 'p7', name: 'Diamond Solitaire Ring', image: '', price: 6500, buyingPrice: 2800, barcode: '2007', stock: 15, category: 'Jewelry', subcategory: 'Ring', description: 'Stunning CZ diamond solitaire ring in white gold setting.' },
  { id: 'p8', name: 'Stacking Ring Set', image: '', price: 1500, buyingPrice: 600, barcode: '2008', stock: 40, category: 'Jewelry', subcategory: 'Ring', description: 'Set of 5 minimalist stacking rings, mixed metals.' },
  { id: 'p9', name: 'Vintage Emerald Ring', image: '', price: 4000, buyingPrice: 1800, barcode: '2009', stock: 18, category: 'Jewelry', subcategory: 'Ring', description: 'Vintage-style emerald green stone ring with filigree band.' },
  { id: 'p10', name: 'Matte Velvet Lipstick', image: '', price: 450, buyingPrice: 150, barcode: '3001', stock: 120, category: 'Makeup', subcategory: 'Lipstick', description: 'Long-lasting matte finish lipstick, rich pigmentation.' },
  { id: 'p11', name: 'Glossy Lip Color', image: '', price: 380, buyingPrice: 130, barcode: '3002', stock: 90, category: 'Makeup', subcategory: 'Lip Gloss', description: 'High-shine glossy lip color with moisturizing formula.' },
  { id: 'p12', name: 'Liquid Lipstick Pro', image: '', price: 650, buyingPrice: 250, barcode: '3003', stock: 75, category: 'Makeup', subcategory: 'Lipstick', description: 'Professional-grade liquid lipstick, 12-hour wear.' },
  { id: 'p13', name: 'Hydrating Face Cream', image: '', price: 950, buyingPrice: 350, barcode: '3004', stock: 85, category: 'Skin', subcategory: 'Moisturizer', description: 'Deep hydrating face cream with hyaluronic acid and vitamin E.' },
  { id: 'p14', name: 'Night Repair Cream', image: '', price: 1400, buyingPrice: 550, barcode: '3005', stock: 55, category: 'Skin', subcategory: 'Night Cream', description: 'Intensive overnight repair cream with retinol and collagen.' },
  { id: 'p15', name: 'SPF50 Sunscreen Cream', image: '', price: 750, buyingPrice: 300, barcode: '3006', stock: 100, category: 'Skin', subcategory: 'Sunscreen', description: 'Broad-spectrum SPF50 sunscreen, lightweight, non-greasy.' },
];

// ─── Store ───

interface OrderData {
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

interface StoreState {
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  posCart: CartItem[];
  categories: Category[];
  banners: Banner[];
  wishlist: string[];
  reviews: Review[];

  // Banner actions
  addBanner: (banner: Omit<Banner, 'id'>) => void;
  updateBanner: (id: string, updates: Partial<Banner>) => void;
  deleteBanner: (id: string) => void;

  // Category actions
  addCategory: (name: string, icon?: string, image?: string) => void;
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
  placeOrder: (type: 'online' | 'pos', data?: OrderData) => string;
  deleteOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  // Product actions
  updateStock: (productId: string, change: number) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Wishlist
  toggleWishlist: (productId: string) => void;

  // Reviews
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;

  // Buy Now
  buyNow: (product: Product, qty: number) => void;

  // Helpers
  getCategoryNames: () => string[];
  getSubcategories: (categoryName: string) => string[];
  getProductRating: (productId: string) => { avg: number; count: number };
}

export const useStore = create<StoreState>((set, get) => ({
  products: INITIAL_PRODUCTS,
  orders: [],
  cart: [],
  posCart: [],
  categories: INITIAL_CATEGORIES,
  banners: [
    { id: 'banner-1', image: '', title: 'বৈশাখী অফার — ৩৫% পর্যন্ত ছাড়!', link: '/shop', active: true },
    { id: 'banner-2', image: '', title: '৳৫০০+ অর্ডারে ফ্রি ডেলিভারি', link: '/shop', active: true },
  ],
  wishlist: [],
  reviews: [],

  // ─── Banner actions ───
  addBanner: (banner) => set(s => ({
    banners: [...s.banners, { ...banner, id: `banner-${Date.now()}` }],
  })),
  updateBanner: (id, updates) => set(s => ({
    banners: s.banners.map(b => b.id === id ? { ...b, ...updates } : b),
  })),
  deleteBanner: (id) => set(s => ({
    banners: s.banners.filter(b => b.id !== id),
  })),

  addCategory: (name, icon = '📦', image) => set(s => ({
    categories: [...s.categories, { id: `cat-${Date.now()}`, name, icon, image, subcategories: [] }],
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

  // ─── Buy Now ───
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

  // ─── Orders ───
  placeOrder: (type, data) => {
    const s = get();
    const items = type === 'pos' ? s.posCart : s.cart;
    const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const deliveryCharge = data?.deliveryCharge || 0;
    const discountAmount = data?.discount
      ? (data.discountType === 'percent' ? Math.round(subtotal * data.discount / 100) : data.discount)
      : 0;
    const total = Math.max(0, subtotal - discountAmount) + deliveryCharge;
    const pointsEarned = type === 'online' ? Math.floor(subtotal) : 0;
    const id = `ord-${Date.now()}`;
    const order: Order = {
      id,
      items: [...items],
      total,
      date: new Date().toISOString(),
      status: 'pending',
      type,
      customerName: data?.customerName || (type === 'pos' ? 'Walk-in Customer' : 'Guest'),
      customerEmail: data?.customerEmail,
      customerPhone: data?.customerPhone,
      deliveryAddress: data?.deliveryAddress,
      deliveryZone: data?.deliveryZone,
      deliveryCharge,
      pointsEarned,
      paymentMethod: data?.paymentMethod,
      paymentStatus: data?.paymentStatus || (data?.paymentMethod === 'cod' ? 'pending' : 'paid'),
      splitPayment: data?.splitPayment,
      discount: data?.discount,
      discountType: data?.discountType,
    };
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
  deleteOrder: (orderId) => set(s => ({ orders: s.orders.filter(o => o.id !== orderId) })),
  updateOrderStatus: (orderId, status) => set(s => ({ orders: s.orders.map(o => o.id === orderId ? { ...o, status } : o) })),

  // ─── Products ───
  updateStock: (productId, change) => set(s => ({ products: s.products.map(p => p.id === productId ? { ...p, stock: Math.max(0, p.stock + change) } : p) })),
  addProduct: (product) => set(s => ({ products: [...s.products, { ...product, id: `p${Date.now()}` }] })),
  updateProduct: (id, updates) => set(s => ({ products: s.products.map(p => p.id === id ? { ...p, ...updates } : p) })),
  deleteProduct: (id) => set(s => ({ products: s.products.filter(p => p.id !== id) })),

  // ─── Wishlist ───
  toggleWishlist: (productId) => set(s => ({
    wishlist: s.wishlist.includes(productId)
      ? s.wishlist.filter(id => id !== productId)
      : [...s.wishlist, productId],
  })),

  // ─── Reviews ───
  addReview: (review) => set(s => ({
    reviews: [...s.reviews, { ...review, id: `rev-${Date.now()}`, date: new Date().toISOString() }],
  })),

  // ─── Helpers ───
  getCategoryNames: () => get().categories.map(c => c.name),
  getSubcategories: (categoryName) => {
    const cat = get().categories.find(c => c.name === categoryName);
    return cat ? cat.subcategories : [];
  },
  getProductRating: (productId) => {
    const reviews = get().reviews.filter(r => r.productId === productId);
    if (reviews.length === 0) return { avg: 0, count: 0 };
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    return { avg, count: reviews.length };
  },
}));
