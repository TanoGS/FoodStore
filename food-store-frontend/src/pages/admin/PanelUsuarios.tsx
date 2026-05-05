import { useState, useEffect } from 'react';
import { Shield, Trash2, RefreshCcw, Plus, X } from 'lucide-react';
import { UsuarioService } from '../../services/usuario.service';

export default function PanelUsuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  
  // Estado para el formulario de nuevo usuario
  const [formData, setFormData] = useState({
    email: '', nombre: '', apellido: '', password: '', rol: 'CLIENTE'
  });

  const cargarUsuarios = async () => {
    try {
      const res = await UsuarioService.listar();
      setUsuarios(res.data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await UsuarioService.crear(formData);
      alert("Usuario creado con éxito");
      setModalAbierto(false);
      setFormData({ email: '', nombre: '', apellido: '', password: '', rol: 'CLIENTE' });
      cargarUsuarios();
    } catch (error) {
      console.error(error);
      alert("Error al crear el usuario. Revisa que el email no exista.");
    }
  };

  const toggleEstado = async (usuario: any) => {
    try {
      if (usuario.activo) {
        if(confirm(`¿Seguro que deseas desactivar a ${usuario.email}?`)) {
          await UsuarioService.eliminar(usuario.id);
        }
      } else {
        await UsuarioService.reactivar(usuario.id);
      }
      cargarUsuarios(); // Recargamos la tabla
    } catch (error) {
      console.error("Error cambiando estado:", error);
      alert("Hubo un error al cambiar el estado del usuario.");
    }
  };

  return (
    <div className="p-6 text-slate-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-orange-500" />
          Gestión de Usuarios
        </h2>
        <button 
          onClick={() => setModalAbierto(true)}
          className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
        >
          <Plus className="w-5 h-5" /> Nuevo Usuario
        </button>
      </div>

      {/* --- TABLA DE USUARIOS --- */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-100 border-b">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Nombre</th>
              <th className="p-4">Email</th>
              <th className="p-4">Rol</th>
              <th className="p-4 text-center">Estado</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usr) => (
              <tr key={usr.id} className={`border-b ${!usr.activo ? 'bg-red-50' : 'hover:bg-slate-50'}`}>
                <td className="p-4 text-slate-500">#{usr.id}</td>
                <td className="p-4 font-medium">{usr.nombre} {usr.apellido}</td>
                <td className="p-4 text-slate-600">{usr.email}</td>
                <td className="p-4">
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                    {usr.rol}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${usr.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {usr.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="p-4 text-center">
                  {usr.activo ? (
                    <button onClick={() => toggleEstado(usr)} className="p-2 text-red-600 bg-red-100 hover:bg-red-200 rounded-md transition" title="Desactivar (Soft Delete)">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  ) : (
                    <button onClick={() => toggleEstado(usr)} className="p-2 text-green-600 bg-green-100 hover:bg-green-200 rounded-md transition" title="Reactivar">
                      <RefreshCcw className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL PARA CREAR USUARIO --- */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
            <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold">Registrar Usuario</h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-300 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCrear} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input required type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Apellido</label>
                  <input required type="text" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} className="w-full p-2 border rounded" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contraseña</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rol en el Sistema</label>
                <select value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value})} className="w-full p-2 border rounded bg-white">
                  <option value="CLIENTE">Cliente</option>
                  <option value="GESTOR_STOCK">Gestor de Stock</option>
                  <option value="GESTOR_PEDIDOS">Gestor de Pedidos</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setModalAbierto(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-white bg-orange-600 rounded hover:bg-orange-700">Crear Cuenta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}