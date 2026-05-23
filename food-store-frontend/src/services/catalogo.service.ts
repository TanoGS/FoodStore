import api from '../config/axios';

export const CatalogoService = {
  // ==========================================
  // CATEGORÍAS
  // ==========================================
  async getCategorias() {
    const { data } = await api.get('/catalogo/categorias');
    return data;
  },
  async crearCategoria(payload: any) {
    const { data } = await api.post('/catalogo/categorias', payload);
    return data;
  },
  async actualizarCategoria(id: number, payload: any) {
    const { data } = await api.patch(`/catalogo/categorias/${id}`, payload);
    return data;
  },

  // ==========================================
  // INGREDIENTES Y DEPÓSITO
  // ==========================================
  async getIngredientes() {
    const { data } = await api.get('/catalogo/ingredientes');
    return data;
  },
  async crearIngrediente(payload: any) {
    const { data } = await api.post('/catalogo/ingredientes', payload);
    return data;
  },
  async actualizarIngrediente(id: number, payload: any) {
    const { data } = await api.patch(`/catalogo/ingredientes/${id}`, payload);
    return data;
  },

  // ==========================================
  // PRODUCTOS (RECETAS Y ESCANDALLO)
  // ==========================================
  async getProductos() {
    const { data } = await api.get('/catalogo/productos');
    return data;
  },
  async crearProducto(payload: any) {
    const { data } = await api.post('/catalogo/productos', payload);
    return data;
  },
  async actualizarProducto(id: number, payload: any) {
    const { data } = await api.patch(`/catalogo/productos/${id}`, payload);
    return data;
  }
};