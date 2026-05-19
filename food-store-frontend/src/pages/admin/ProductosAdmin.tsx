import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, ArrowUpRight } from 'lucide-react';
import { CatalogoService } from '../../services/catalogo.service';
import ProductoModal from '../../components/admin/ProductoModal';

export default function ProductosAdmin() {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productoEditando, setProductoEditando] = useState<any | null>(null);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = () => {
    setLoading(true);
    CatalogoService.getProductos()
      .then((data) => setProductos(data))
      .catch((err) => console.error("Error cargando productos:", err))
      .finally(() => setLoading(false));
  };

  const handleGuardar = async (payload: any) => {
    try {
      if (productoEditando) {
        // En un solo paso, el backend actualiza el plato y recalcula la receta
        await CatalogoService.actualizarProducto(productoEditando.id, payload);
      } else {
        await CatalogoService.crearProducto(payload);
      }
      setIsModalOpen(false);
      cargarProductos(); 
    } catch (error: any) {
      console.error(error);
      alert(`Error: ${error.response?.data?.detail || 'No se pudo guardar el producto'}`);
    }
  };

  const handleDesactivar = async (id: number) => {
    if (window.confirm('¿Desactivar este producto? Ya no aparecerá en el menú público.')) {
      try {
        // Usamos un soft-delete (lo desactivamos) para no romper pedidos antiguos
        await CatalogoService.actualizarProducto(id, { activo: false });
        cargarProductos();
      } catch (error) {
        alert("Hubo un error al desactivar el producto.");
      }
    }
  };

  const abrirModalCrear = () => {
    setProductoEditando(null);
    setIsModalOpen(true);
  };

  const abrirModalEditar = (producto: any) => {
    setProductoEditando(producto);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Catálogo y Recetas</h1>
          <p className="text-slate-500 mt-1">Arma tus platos, asigna recetas y visualiza el margen financiero.</p>
        </div>
        <button 
          onClick={abrirModalCrear}
          className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-600/20 transition-all"
        >
          <Plus className="h-5 w-5" /> Armar Nuevo Plato
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <th className="p-4 font-bold">Plato</th>
              <th className="p-4 font-bold">Costo Producción</th>
              <th className="p-4 font-bold text-orange-600">Margen (%)</th>
              <th className="p-4 font-bold text-green-600">Precio Final</th>
              <th className="p-4 font-bold text-center">Estado</th>
              <th className="p-4 font-bold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
               <tr><td colSpan={6} className="p-8 text-center text-slate-500 font-medium">Cargando menú y calculando costos...</td></tr>
            ) : productos.length === 0 ? (
               <tr><td colSpan={6} className="p-8 text-center text-slate-500">No hay platos armados todavía.</td></tr>
            ) : productos.map((prod) => (
              <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="font-black text-slate-800">{prod.nombre}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{prod.stock} unid. en stock local</div>
                </td>
                <td className="p-4 font-medium text-slate-500">
                  ${prod.costo_produccion}
                </td>
                <td className="p-4 font-bold text-orange-600 flex items-center gap-1 mt-2">
                  <ArrowUpRight className="w-4 h-4" /> {prod.margen_ganancia}%
                </td>
                <td className="p-4 font-black text-green-600 text-lg">
                  ${prod.precio}
                </td>
                <td className="p-4 text-center">
                  <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase ${prod.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {prod.activo ? 'En Menú' : 'Oculto'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => abrirModalEditar(prod)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                    <Edit className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDesactivar(prod.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ProductoModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleGuardar} 
          productoEditar={productoEditando} 
        />
      )}
    </div>
  );
}