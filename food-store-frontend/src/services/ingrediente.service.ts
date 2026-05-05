
import api from '../config/axios';
import { type Ingrediente } from '../types/ingrediente.type';

export const IngredienteService = {
  async listarTodos(): Promise<Ingrediente[]> {
    const { data } = await api.get('/ingredientes/');
    return data?.data || data || [];
  },

  async crear(data: Partial<Ingrediente>): Promise<Ingrediente> {
    const response = await api.post('/ingredientes/', data);
    return response.data;
  },

  async actualizar(id: number, data: Partial<Ingrediente>): Promise<Ingrediente> {
    const response = await api.patch(`/ingredientes/${id}`, data);
    return response.data;
  },

  async eliminar(id: number): Promise<void> {
    await api.delete(`/ingredientes/${id}`);
  }
};