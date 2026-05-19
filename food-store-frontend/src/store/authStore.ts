import { create } from 'zustand';
import { persist } from 'zustand/middleware';

//  Definimos cómo luce un Rol individual
export interface Role {
  id: number;
  nombre: string;
}

// El usuario ahora tiene un arreglo de roles
export interface User {
  id: number;
  email: string;
  nombre: string;
  cel?: string;
  roles?: any[];
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