import { useState, useEffect } from 'react';
import { MapPin, Plus, Home, Star, X } from 'lucide-react';
import { DireccionService, type Direccion } from '../../services/direccion.service';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function MisDirecciones() {
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [loading, setLoading] = useState(false);

  // Protección rápida: si no hay sesión, al login
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    calle: '',
    numero: '',
    piso: '',
    departamento: '',
    localidad: 'Mendoza', // Ciudad por defecto
    referencias: '',
    es_principal: false
  });

  const cargarDirecciones = async () => {
    try {
      const data = await DireccionService.listarMisDirecciones();
      setDirecciones(data);
    } catch (error) {
      console.error("Error cargando direcciones:", error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      cargarDirecciones();
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await DireccionService.crear(formData);
      setModalAbierto(false);
      setFormData({
        calle: '', numero: '', piso: '', departamento: '', localidad: 'Mendoza', referencias: '', es_principal: false
      });
      cargarDirecciones(); // Recargar la lista
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar la dirección.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-8">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2">
            <MapPin className="text-orange-600 w-8 h-8" />
            Mis Direcciones
          </h2>
          <p className="text-slate-500 mt-1">Gestiona tus lugares de entrega</p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" /> Nueva Dirección
        </button>
      </div>

      {/* --- GRILLA DE DIRECCIONES --- */}
      {direcciones.length === 0 ? (
        <div className="text-center bg-slate-50 p-12 rounded-2xl border-2 border-dashed border-slate-200">
          <Home className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700">Aún no tienes direcciones</h3>
          <p className="text-slate-500 mt-2">Agrega tu primer domicilio para recibir tus pedidos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {direcciones.map((dir) => (
            <div 
              key={dir.id} 
              className={`p-6 rounded-2xl border-2 relative transition-all ${
                dir.es_principal ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-white hover:border-orange-300'
              }`}
            >
              {dir.es_principal && (
                <span className="absolute -top-3 -right-3 bg-orange-500 text-white p-2 rounded-full shadow-md" title="Dirección Predeterminada">
                  <Star className="w-5 h-5 fill-current" />
                </span>
              )}
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {dir.calle} {dir.numero}
              </h3>
              <p className="text-slate-600">
                {dir.piso && dir.departamento ? `Piso ${dir.piso} - Depto ${dir.departamento}` : 'Casa'}
              </p>
              <p className="text-slate-600">{dir.localidad}</p>
              {dir.referencias && (
                <p className="text-sm text-slate-500 italic mt-3 bg-white/60 p-2 rounded-lg">
                  "{dir.referencias}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL PARA NUEVA DIRECCIÓN --- */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-slate-800 p-5 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold">Agregar Domicilio</h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-300 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Calle *</label>
                  <input required type="text" value={formData.calle} onChange={e => setFormData({...formData, calle: e.target.value})} className="w-full p-2.5 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Número *</label>
                  <input required type="text" value={formData.numero} onChange={e => setFormData({...formData, numero: e.target.value})} className="w-full p-2.5 border rounded-lg" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Piso (Opc.)</label>
                  <input type="text" value={formData.piso} onChange={e => setFormData({...formData, piso: e.target.value})} className="w-full p-2.5 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Depto (Opc.)</label>
                  <input type="text" value={formData.departamento} onChange={e => setFormData({...formData, departamento: e.target.value})} className="w-full p-2.5 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Localidad *</label>
                  <input required type="text" value={formData.localidad} onChange={e => setFormData({...formData, localidad: e.target.value})} className="w-full p-2.5 border rounded-lg" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Referencias de entrega (Opcional)</label>
                <textarea value={formData.referencias} onChange={e => setFormData({...formData, referencias: e.target.value})} className="w-full p-2.5 border rounded-lg" rows={2} placeholder="Ej: Casa rejas negras, timbre rojo..."></textarea>
              </div>

              <div className="flex items-center gap-2 mt-4 bg-orange-50 p-3 rounded-lg border border-orange-100">
                <input type="checkbox" id="principal" checked={formData.es_principal} onChange={e => setFormData({...formData, es_principal: e.target.checked})} className="w-5 h-5 text-orange-600 rounded border-orange-300 focus:ring-orange-500" />
                <label htmlFor="principal" className="text-sm font-medium text-orange-900 cursor-pointer">
                  Marcar como dirección principal
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6 border-t pt-6">
                <button type="button" onClick={() => setModalAbierto(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition">Cancelar</button>
                <button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl font-bold transition disabled:opacity-50">
                  {loading ? 'Guardando...' : 'Guardar Domicilio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}