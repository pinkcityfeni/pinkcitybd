import { create } from 'zustand';

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'cashier' | 'customer';
  points: number;
  orders: number;
  createdAt: string;
}

interface UserRegistryState {
  users: RegisteredUser[];
  addUser: (user: Omit<RegisteredUser, 'points' | 'orders' | 'createdAt'>) => void;
  removeUser: (id: string) => void;
  updateRole: (id: string, role: RegisteredUser['role']) => void;
}

export const useUserRegistry = create<UserRegistryState>((set) => ({
  users: [
    { id: 'u1', name: 'Admin User', email: 'pinkcity.feni@gmail.com', phone: '01715307271', role: 'admin', points: 0, orders: 0, createdAt: '2026-01-01' },
  ],

  addUser: (user) =>
    set((state) => {
      if (state.users.some((u) => u.email === user.email)) return state;
      return {
        users: [
          ...state.users,
          { ...user, phone: user.phone || '', points: 0, orders: 0, createdAt: new Date().toISOString().slice(0, 10) },
        ],
      };
    }),

  removeUser: (id) =>
    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
    })),

  updateRole: (id, role) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, role } : u)),
    })),
}));
