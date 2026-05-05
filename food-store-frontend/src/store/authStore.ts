import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define cómo luce un Usuario en el frontend
export interface User {
  id: number;
  email: string;
  nombre: string;
  rol: 'ADMIN' | 'CLIENTE' | 'GESTOR_STOCK' | 'GESTOR_PEDIDOS';
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  
  // Acciones
  setLogin: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setLogin: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'food-store-auth', // Se guarda en localStorage
    }
  )
);