import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { IngredienteService } from '../../services/ingrediente.service';
import { type Ingrediente } from '../../types/ingrediente.type';
import IngredienteModal from '../../components/admin/IngredienteModal';

export default function IngredientesAdmin() {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ingredienteEditando, setIngredienteEditando] = useState<Ingrediente | null>(null);

  useEffect(() => {
    cargarIngredientes();
  }, []);

  const cargarIngredientes = () => {
    setLoading(true);
    IngredienteService.listarTodos()
      .then((data) => setIngredientes(data))
      .finally(() => setLoading(false));
  };

  const handleGuardar = async (payload: any) => {
    try {
      if (ingredienteEditando) {
        await IngredienteService.actualizar(ingredienteEditando.id, payload);
      } else {
        await IngredienteService.crear(payload);
      }
      setIsModalOpen(false);
      cargarIngredientes();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || 'No se pudo guardar el ingrediente'}`);
    }
  };

  const handleEliminar = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este ingrediente?')) {
      try {
        await IngredienteService.eliminar(id);
        cargarIngredientes();
      } catch (error) {
        alert("No se pudo eliminar. Puede que esté siendo usado en un producto.");
      }
    }
  };

  const abrirModalCrear = () => {
    setIngredienteEditando(null);
    setIsModalOpen(true);
  };

  const abrirModalEditar = (ingrediente: Ingrediente) => {
    setIngredienteEditando(ingrediente);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Ingredientes</h1>
          <p className="text-gray-500 mt-1">Administra los extras y alérgenos de tu menú.</p>
        </div>
        <button onClick={abrirModalCrear} className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2">
          <Plus className="h-5 w-5" /> Nuevo Ingrediente
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Nombre</th>
              <th className="p-4 font-semibold">Precio Extra</th>
              <th className="p-4 font-semibold text-center">Alérgeno</th>
              <th className="p-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center">Cargando...</td></tr>
            ) : ingredientes.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No hay ingredientes registrados.</td></tr>
            ) : ingredientes.map((ing) => (
              <tr key={ing.id} className="hover:bg-gray-50 transition">
                <td className="p-4 text-gray-500">#{ing.id}</td>
                <td className="p-4 font-bold text-gray-900">{ing.nombre}</td>
                <td className="p-4 text-orange-600 font-medium">
                  {ing.precio_adicional > 0 ? `+$${ing.precio_adicional}` : 'Sin costo extra'}
                </td>
                <td className="p-4 text-center">
                  {ing.es_alergeno ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                      <AlertTriangle className="h-3 w-3" /> Sí
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">No</span>
                  )}
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => abrirModalEditar(ing)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleEliminar(ing.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <IngredienteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleGuardar} ingredienteEditar={ingredienteEditando} />
    </div>
  );
}