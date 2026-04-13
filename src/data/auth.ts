import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

type AppRole = 'admin' | 'cashier' | 'customer';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: AppRole;
}

interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
}

export const useAuth = create<AuthState>()((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  loading: true,

  setSession: (session) => set({ session, isAuthenticated: !!session }),
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (loading) => set({ loading }),

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, isAuthenticated: false });
  },

  hasRole: (role) => {
    const user = get().user;
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.role === role;
  },
}));

// Fetch user profile + role from DB
async function fetchUserProfile(supabaseUser: User): Promise<AuthUser> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, phone')
    .eq('user_id', supabaseUser.id)
    .single();

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', supabaseUser.id)
    .single();

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: profile?.name || supabaseUser.user_metadata?.name || supabaseUser.email || '',
    phone: profile?.phone || '',
    role: (roleData?.role as AppRole) || 'customer',
  };
}

// Initialize auth listener — call once at app startup
let initialized = false;
export function initAuth() {
  if (initialized) return;
  initialized = true;

  const store = useAuth.getState();

  // Listen for auth changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    useAuth.getState().setSession(session);

    if (session?.user) {
      // Use setTimeout to avoid Supabase deadlock on initial load
      setTimeout(async () => {
        const profile = await fetchUserProfile(session.user);
        useAuth.getState().setUser(profile);
        useAuth.getState().setLoading(false);
      }, 0);
    } else {
      useAuth.getState().setUser(null);
      useAuth.getState().setLoading(false);
    }
  });

  // Check existing session
  supabase.auth.getSession().then(async ({ data: { session } }) => {
    store.setSession(session);
    if (session?.user) {
      const profile = await fetchUserProfile(session.user);
      store.setUser(profile);
    }
    store.setLoading(false);
  });
}
