import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'cashier' | 'customer';
  
  orders: number;
  createdAt: string;
}

interface UserRegistryState {
  users: RegisteredUser[];
  addUser: (user: Omit<RegisteredUser, 'orders' | 'createdAt'>) => void;
  removeUser: (id: string) => void;
  updateRole: (id: string, role: RegisteredUser['role']) => void;
}

export const useUserRegistry = create<UserRegistryState>()(persist((set) => ({
  users: [
    { id: 'u1', name: 'Admin User', email: 'pinkcity.feni@gmail.com', phone: '01715307271', role: 'admin', orders: 0, createdAt: '2026-01-01' },
  ],

  addUser: (user) =>
    set((state) => {
      if (state.users.some((u) => u.email === user.email)) return state;
      return {
        users: [
          ...state.users,
          { ...user, phone: user.phone || '', orders: 0, createdAt: new Date().toISOString().slice(0, 10) },
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
}), { name: 'glamora-users' }));
