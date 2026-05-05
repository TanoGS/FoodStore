import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// INTERCEPTOR DE PETICIONES (Agrega el Token)
api.interceptors.request.use(
  (config) => {
    // Vamos a buscar el token al store de Zustand
    const token = useAuthStore.getState().token;
    
    if (token && config.headers) {
      // Si hay token, se lo inyectamos al header de Authorization
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// INTERCEPTOR DE RESPUESTAS (Maneja si el token expiró)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si FastAPI nos devuelve un 401 (No Autorizado), el token expiró o es inválido
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login'; // Pateamos al usuario al login
    }
    return Promise.reject(error);
  }
);

export default api;