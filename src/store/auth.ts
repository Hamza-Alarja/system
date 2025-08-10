import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive?: boolean; // حسب حاجتك
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => {
      // انشئ عميل supabase هنا داخل الستيت (client component client)
      const supabase = createClientComponentClient();

      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,

        login: async (email: string, password: string) => {
          set({ isLoading: true });
          try {
            if (typeof email !== 'string' || typeof password !== 'string') {
              throw new Error('Email and password must be strings');
            }

            const { data, error } = await supabase.auth.signInWithPassword({
              email: email.trim(),
              password: password.trim(),
            });

            if (error) throw error;
            if (!data.user) throw new Error('User not found after login');

            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('name, role')
              .eq('auth_user_id', data.user.id)
              .single();

            if (userError) throw userError;

            set({
              user: {
                id: data.user.id,
                email: data.user.email || email,
                name: userData?.name || '',
                role: userData?.role || 'employee',
              },
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            set({ isLoading: false });
            console.error('Login error:', error);
            throw error;
          }
        },

        logout: async () => {
          set({ isLoading: true });
          try {
            await supabase.auth.signOut();
          } finally {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        },

        checkAuth: async () => {
          set({ isLoading: true });
          try {
            const {
              data: { session },
            } = await supabase.auth.getSession();

            if (session?.user) {
              const { data: userData, error: profileError } = await supabase
                .from('users')
                .select('name, role')
                .eq('auth_user_id', session.user.id)
                .single();

              if (profileError || !userData) throw profileError;

              set({
                user: {
                  id: session.user.id,
                  email: session.user.email ?? '',
                  name: userData.name ?? '',
                  role: userData.role ?? 'employee',
                },
                isAuthenticated: true,
                isLoading: false,
              });
            } else {
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
              });
            }
          } catch (error) {
            console.error('checkAuth error:', error);
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        },
      };
    },
    {
      name: 'auth-storage',
    }
  )
);
