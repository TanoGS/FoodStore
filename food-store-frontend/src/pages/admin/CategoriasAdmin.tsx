import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { CategoriaService } from '../../services/categoria.service';
import { type Categoria } from '../../types/categoria.type';
import CategoriaModal from '../../components/admin/CategoriaModal';

export default function CategoriasAdmin() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = () => {
    setLoading(true);
    CategoriaService.listarConProductos()
      .then((data) => setCategorias(data))
      .finally(() => setLoading(false));
  };

  const handleGuardar = async (payload: any) => {
    try {
      if (categoriaEditando) {
        await CategoriaService.actualizar(categoriaEditando.id, payload);
      } else {
        await CategoriaService.crear(payload);
      }
      setIsModalOpen(false);
      cargarCategorias();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || 'No se pudo guardar'}`);
    }
  };

  const handleEliminar = async (id: number) => {
    if (window.confirm('¿Eliminar esta categoría? Los productos asociados podrían quedar sin categoría.')) {
      try {
        await CategoriaService.eliminar(id);
        cargarCategorias();
      } catch (error) {
        alert("No se pudo eliminar la categoría.");
      }
    }
  };

  const abrirModalCrear = () => {
    setCategoriaEditando(null);
    setIsModalOpen(true);
  };

  const abrirModalEditar = (categoria: Categoria) => {
    setCategoriaEditando(categoria);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Categorías</h1>
        </div>
        <button onClick={abrirModalCrear} className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2">
          <Plus className="h-5 w-5" /> Nueva Categoría
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Nombre</th>
              <th className="p-4 font-semibold">Cantidad de Productos</th>
              <th className="p-4 font-semibold">Descripción</th>
              <th className="p-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center">Cargando...</td></tr>
            ) : categorias.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50 transition">
                <td className="p-4 text-gray-500">#{cat.id}</td>
                <td className="p-4 font-bold text-gray-900">{cat.nombre}</td>
                <td className="p-4 text-orange-600 font-medium">{cat.productos ? cat.productos.length : 0}</td>
                <td className="p-4 text-gray-500 text-sm">{cat.descripcion || '-'}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => abrirModalEditar(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleEliminar(cat.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CategoriaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleGuardar} categoriaEditar={categoriaEditando} />
    </div>
  );
}