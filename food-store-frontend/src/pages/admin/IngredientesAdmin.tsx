import { useEffect, useState } from 'react';
import { Edit, Trash2, AlertTriangle } from 'lucide-react';
import { CatalogoService } from '../../services/catalogo.service';
import IngredienteModal from '../../components/admin/IngredienteModal';

export default function IngredientesAdmin() {
  const [ingredientes, setIngredientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ingredienteEditando, setIngredienteEditando] = useState<any | null>(null);

  useEffect(() => {
    cargarIngredientes();
  }, []);

  const cargarIngredientes = () => {
    setLoading(true);
    CatalogoService.getIngredientes()
      .then((data) => setIngredientes(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleGuardar = async (payload: any) => {
    try {
      if (ingredienteEditando) {
        await CatalogoService.actualizarIngrediente(ingredienteEditando.id, payload);
      } else {
        await CatalogoService.crearIngrediente(payload);
      }
      setIsModalOpen(false);
      cargarIngredientes();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || 'No se pudo guardar'}`);
    }
  };

  const abrirModalEditar = (ing: any) => {
    setIngredienteEditando(ing);
    setIsModalOpen(true);
  };

  const abrirModalNuevo = () => {
    setIngredienteEditando(null);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-slate-800">Depósito e Insumos</h2>
        <button onClick={abrirModalNuevo} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-bold transition-colors">
          + Nuevo Ingrediente
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm">
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Nombre</th>
              <th className="p-4 font-semibold">Stock Actual</th>
              <th className="p-4 font-semibold">Costo Unitario</th>
              <th className="p-4 font-semibold text-center">Alerta Médica</th>
              <th className="p-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Cargando depósito...</td></tr>
            ) : ingredientes.map((ing) => (
              <tr key={ing.id} className="hover:bg-gray-50 transition">
                <td className="p-4 text-gray-500">#{ing.id}</td>
                <td className="p-4 font-bold text-gray-900">{ing.nombre}</td>
                <td className="p-4 font-medium text-slate-700">
                  {ing.stock} <span className="text-xs text-gray-400">{ing.unidad_medida}</span>
                </td>
                <td className="p-4 text-orange-600 font-medium">
                  ${ing.costo_unitario}
                </td>
                <td className="p-4 text-center">
                  {ing.es_alergeno ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                      <AlertTriangle className="h-3 w-3" /> Alérgeno
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">Seguro</span>
                  )}
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => abrirModalEditar(ing)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
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
        <IngredienteModal
          ingrediente={ingredienteEditando}
          onClose={() => setIsModalOpen(false)}
          onSave={handleGuardar}
        />
      )}
    </div>
  );
}