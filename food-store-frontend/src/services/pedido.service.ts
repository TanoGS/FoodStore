import api from '../config/axios';

// 1. Molde del Pedido que devuelve el backend
export interface Pedido {
  id: number;
  estado: string;
  total: number;
  fecha_creacion: string;
}

// 👇 2. NUEVO: Molde para los items que enviamos al comprar
export interface PedidoItemPayload {
  producto_id: number;
  cantidad: number;
}

// 👇 3. NUEVO: Molde exacto del payload de creación
export interface CrearPedidoPayload {
  direccion_id: number;
  items: PedidoItemPayload[];
}

export const PedidoService = {
  // Trae todos los pedidos
  listarTodos: async (): Promise<Pedido[]> => {
    const { data } = await api.get('/pedidos/');
    return data.data || data; 
  },

  // Cambia el estado del pedido
  actualizarEstado: async (id: number, nuevoEstado: string): Promise<Pedido> => {
    const { data } = await api.patch(`/pedidos/${id}/estado`, { estado: nuevoEstado });
    return data;
  },

  // 👇 4. REEMPLAZAMOS LOS 'any' CON NUESTRAS INTERFACES
  crear: async (payload: CrearPedidoPayload): Promise<Pedido> => {
    const { data } = await api.post('/pedidos/', payload);
    return data; // Generalmente el backend devuelve el pedido creado
  }
};