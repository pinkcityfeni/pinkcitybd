import { create } from 'zustand';
import { useUserRegistry } from './userRegistry';

interface AuthState {
  user: { id: string; email: string; name: string; role: 'customer' | 'admin' | 'cashier' } | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  hasRole: (role: 'admin' | 'cashier' | 'customer') => boolean;
}

const normalizeEmail = (value: string) => value.trim().toLowerCase();
const normalizePassword = (value: string) => value.trim();

// Demo accounts for testing protected routes
const DEMO_ACCOUNTS = [
  { id: 'u1', email: normalizeEmail('pinkcity.feni@gmail.com'), password: normalizePassword('rihan56'), name: 'Admin User', role: 'admin' as const },
  { id: 'u2', email: normalizeEmail('cashier@shop.com'), password: normalizePassword('cashier123'), name: 'Cashier', role: 'cashier' as const },
  { id: 'u3', email: normalizeEmail('user@shop.com'), password: normalizePassword('user123'), name: 'Demo Customer', role: 'customer' as const },
];

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  login: (email, password) => {
    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = normalizePassword(password);
    const account = DEMO_ACCOUNTS.find(
      (a) => a.email === normalizedEmail && a.password === normalizedPassword,
    );

    if (account) {
      const userInfo = { id: account.id, email: account.email, name: account.name, role: account.role };
      set({ user: userInfo, isAuthenticated: true });
      // Register in user registry
      useUserRegistry.getState().addUser(userInfo);
      return true;
    }
    return false;
  },

  signup: (name, email, password) => {
    const normalizedName = name.trim();
    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = normalizePassword(password);
    if (!normalizedName || !normalizedEmail || !normalizedPassword) return false;
    const newUser = { id: `u-${Date.now()}`, email: normalizedEmail, name: normalizedName, role: 'customer' as const };
    set({ user: newUser, isAuthenticated: true });
    // Register in user registry
    useUserRegistry.getState().addUser(newUser);
    return true;
  },

  logout: () => set({ user: null, isAuthenticated: false }),

  hasRole: (role) => {
    const user = get().user;
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.role === role;
  },
}));
