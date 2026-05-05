import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { ProductoService } from '../../services/producto.service';
import { type Producto } from '../../types/producto.type';
import ProductoModal from '../../components/admin/ProductoModal'; // 👈 Importamos el modal
import axios from '../../config/axios';

export default function ProductosAdmin() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para controlar el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = () => {
    setLoading(true);
    ProductoService.listarActivos()
      .then((data) => setProductos(data))
      .finally(() => setLoading(false));
  };

  // Función para manejar el Guardar (Crea o Edita)
  const handleGuardar = async (payload: any) => {
    try {
      if (productoEditando) {
        await ProductoService.actualizar(productoEditando.id, payload);
      } else {
        await ProductoService.crear(payload);
      }
      setIsModalOpen(false);
      cargarProductos(); // Recargamos la tabla para ver los cambios
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar el producto.");
    }
  };

  // Función para manejar el Eliminar
  const handleEliminar = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await ProductoService.eliminar(id);
        cargarProductos();
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Hubo un error al eliminar el producto.");
      }
    }
  };

  const abrirModalCrear = () => {
    setProductoEditando(null);
    setIsModalOpen(true);
  };

  const abrirModalEditar = (producto: Producto) => {
    setProductoEditando(producto);
    setIsModalOpen(true);
  };

  const handleSave = async (payloadProducto: any, ingredienteIds: number[]) => {
  try {
    let productoId;

    if (productoEditando) {
      // 1. Actualizar producto existente
      await ProductoService.actualizar(productoEditando.id, payloadProducto);
      productoId = productoEditando.id;
    } else {
      // 1. Crear nuevo producto
      const nuevoProd = await ProductoService.crear(payloadProducto);
      productoId = nuevoProd.id;
    }

    // 2. Asociar los ingredientes llamando a /api/productos/{id}/ingredientes
    // Tu endpoint seguramente espera un payload como { ingrediente_ids: [1, 2, 3] }
    await axios.post(`/api/productos/${productoId}/ingredientes`, {
      ingrediente_ids: ingredienteIds
    });

    alert("Producto guardado con éxito!");
    // Recargar tabla y cerrar modal...
    
  } catch (error) {
    console.error("Error guardando:", error);
  }
};

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
        </div>
        <button 
          onClick={abrirModalCrear} // 👈 Conectado
          className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition"
        >
          <Plus className="h-5 w-5" /> Nuevo Producto
        </button>
      </div>

      {/* Tabla (El mismo código que ya tenías) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          {/* ... Thead ... */}
          <tbody className="divide-y divide-gray-100">
            {loading ? (
               <tr><td colSpan={6} className="p-8 text-center">Cargando...</td></tr>
            ) : productos.map((prod) => (
              <tr key={prod.id} className="hover:bg-gray-50 transition">
                <td className="p-4 text-gray-500">#{prod.id}</td>
                <td className="p-4 font-bold">{prod.nombre}</td>
                <td className="p-4 font-medium">${prod.precio_base}</td>
                <td className="p-4">{prod.stock_disponible} unid.</td>
                <td className="p-4">{prod.activo ? 'Activo' : 'Inactivo'}</td>
                <td className="p-4 text-right space-x-2">
                  <button 
                    onClick={() => abrirModalEditar(prod)} // 👈 Conectado
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleEliminar(prod.id)} // 👈 Conectado
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Renderizamos el Modal al final */}
      <ProductoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleGuardar} 
        productoEditar={productoEditando} 
      />
    </div>
  );
}