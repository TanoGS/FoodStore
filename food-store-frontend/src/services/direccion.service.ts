import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export interface Direccion {
  id: number;
  calle: string;
  numero: string;
  piso?: string;         // Opcional
  departamento?: string; // Opcional
  localidad: string;
  referencias?: string;  // Opcional
  es_principal: boolean;
}

// 2. Interfaz para CREAR (Sin ID, porque lo genera el backend)
export interface CrearDireccionPayload {
  calle: string;
  numero: string;
  piso?: string;
  departamento?: string;
  localidad: string;
  referencias?: string;
  es_principal: boolean;
}

const API_URL = 'http://127.0.0.1:8000/api/direcciones';

// Helper para sacar el token de Zustand y armar los headers
const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const DireccionService = {
  listarMisDirecciones: async () => {
    const response = await axios.get(`${API_URL}/`, getAuthHeaders());
    return response.data;
  },

  crear: async (datos: CrearDireccionPayload) => {
    const response = await axios.post(`${API_URL}/`, datos, getAuthHeaders());
    return response.data;
  }
};