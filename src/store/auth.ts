import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/app/db/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
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

          // 2. جلب بيانات المستخدم من جدول users (يشمل الدور role)
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_user_id', data.user.id) // ✅ بدل id استخدم auth_user_id
            .single();


          if (userError) throw userError;

          // 3. تحديث حالة المستخدم في Zustand مع كل البيانات المطلوبة
          set({
            user: {
              id: data.user.id,
              email: userData.email || data.user.email || '',
              name: userData.name || '',
              role: userData.role || 'owner',
              isActive: userData.is_active || false,
            },
            isAuthenticated: true,
          });

          // 4. ترجع بيانات الدخول (اختياري)
          return data;
        } catch (error) {
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
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileError || !userData) throw profileError;

            set({
              user: {
                id: session.user.id,
                email: session.user.email ?? '',
                name: userData.full_name ?? '',
                role: userData.role,
                isActive: true,
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
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
