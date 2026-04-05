import { create } from 'zustand';

interface AuthState {
  user: { id: string; email: string; name: string; role: 'customer' | 'admin' | 'cashier' } | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  hasRole: (role: 'admin' | 'cashier' | 'customer') => boolean;
}

// Demo accounts for testing protected routes
const DEMO_ACCOUNTS = [
  { id: 'u1', email: 'admin@shop.com', password: 'admin123', name: 'Admin User', role: 'admin' as const },
  { id: 'u2', email: 'cashier@shop.com', password: 'cashier123', name: 'Cashier', role: 'cashier' as const },
  { id: 'u3', email: 'user@shop.com', password: 'user123', name: 'Demo Customer', role: 'customer' as const },
];

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  login: (email, password) => {
    const account = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password);
    if (account) {
      set({ user: { id: account.id, email: account.email, name: account.name, role: account.role }, isAuthenticated: true });
      return true;
    }
    return false;
  },

  signup: (name, email, password) => {
    // In demo mode, just create a customer account
    if (!name || !email || !password) return false;
    set({
      user: { id: `u-${Date.now()}`, email, name, role: 'customer' },
      isAuthenticated: true,
    });
    return true;
  },

  logout: () => set({ user: null, isAuthenticated: false }),

  hasRole: (role) => {
    const user = get().user;
    if (!user) return false;
    if (user.role === 'admin') return true; // admin has all access
    return user.role === role;
  },
}));
