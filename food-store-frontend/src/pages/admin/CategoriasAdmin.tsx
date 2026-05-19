import { useEffect, useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { CatalogoService } from '../../services/catalogo.service';
import CategoriaModal from '../../components/admin/CategoriaModal';

export default function CategoriasAdmin() {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<any | null>(null);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = () => {
    setLoading(true);
    CatalogoService.getCategorias()
      .then((data) => setCategorias(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleGuardar = async (payload: any) => {
    try {
      if (categoriaEditando) {
        await CatalogoService.actualizarCategoria(categoriaEditando.id, payload);
      } else {
        await CatalogoService.crearCategoria(payload);
      }
      setIsModalOpen(false);
      cargarCategorias();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || 'No se pudo guardar'}`);
    }
  };

  const abrirModalEditar = (categoria: any) => {
    setCategoriaEditando(categoria);
    setIsModalOpen(true);
  };

  const abrirModalNuevo = () => {
    setCategoriaEditando(null);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-slate-800">Categorías del Menú</h2>
        <button onClick={abrirModalNuevo} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-bold transition-colors">
          + Nueva Categoría
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm">
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Nombre</th>
              <th className="p-4 font-semibold">Padre</th>
              <th className="p-4 font-semibold">Descripción</th>
              <th className="p-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Cargando catálogo...</td></tr>
            ) : categorias.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50 transition">
                <td className="p-4 text-gray-500">#{cat.id}</td>
                <td className="p-4 font-bold text-gray-900">{cat.nombre}</td>
                <td className="p-4 text-gray-500 text-sm">{cat.parent_id ? `Subcategoría de #${cat.parent_id}` : 'Categoría Principal'}</td>
                <td className="p-4 text-gray-500 text-sm">{cat.descripcion || '-'}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => abrirModalEditar(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <CategoriaModal
          categoria={categoriaEditando}
          onClose={() => setIsModalOpen(false)}
          onSave={handleGuardar}
          categoriasDisponibles={categorias} 
        />
      )}
    </div>
  );
}