import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useUserRegistry } from './userRegistry';

interface AuthState {
  user: { id: string; email: string; name: string; phone: string; role: 'customer' | 'admin' | 'cashier' } | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string, phone: string) => boolean;
  logout: () => void;
  hasRole: (role: 'admin' | 'cashier' | 'customer') => boolean;
}

const normalizeEmail = (value: string) => value.trim().toLowerCase();
const normalizePassword = (value: string) => value.trim();

// Demo accounts for testing protected routes
const DEMO_ACCOUNTS = [
  { id: 'u1', email: normalizeEmail('pinkcity.feni@gmail.com'), password: normalizePassword('rihan56'), name: 'Admin User', phone: '01715307271', role: 'admin' as const },
  { id: 'u2', email: normalizeEmail('cashier@shop.com'), password: normalizePassword('cashier123'), name: 'Cashier', phone: '', role: 'cashier' as const },
  { id: 'u3', email: normalizeEmail('user@shop.com'), password: normalizePassword('user123'), name: 'Demo Customer', phone: '', role: 'customer' as const },
];

export const useAuth = create<AuthState>()(persist((set, get) => ({
  user: null,
  isAuthenticated: false,

  login: (email, password) => {
    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = normalizePassword(password);
    const account = DEMO_ACCOUNTS.find(
      (a) => a.email === normalizedEmail && a.password === normalizedPassword,
    );

    if (account) {
      const userInfo = { id: account.id, email: account.email, name: account.name, phone: account.phone, role: account.role };
      set({ user: userInfo, isAuthenticated: true });
      useUserRegistry.getState().addUser(userInfo);
      return true;
    }
    return false;
  },

  signup: (name, email, password, phone) => {
    const normalizedName = name.trim();
    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = normalizePassword(password);
    const normalizedPhone = phone.trim();
    if (!normalizedName || !normalizedEmail || !normalizedPassword) return false;
    const newUser = { id: `u-${Date.now()}`, email: normalizedEmail, name: normalizedName, phone: normalizedPhone, role: 'customer' as const };
    set({ user: newUser, isAuthenticated: true });
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
}), { name: 'glamora-auth' }));
