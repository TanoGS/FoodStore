import axios from 'axios';
import { useAuthStore } from '../store/authStore';

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

  crear: async (datos: any) => {
    const response = await axios.post(`${API_URL}/`, datos, getAuthHeaders());
    return response.data;
  }
};