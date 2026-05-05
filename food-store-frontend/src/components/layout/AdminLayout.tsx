import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Package, Tags, Carrot, LogOut, LayoutDashboard, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useEffect } from 'react';

export default function AdminLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Protección de ruta: Si no está logueado, lo pateamos al login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null; // Evita parpadeos mientras redirige

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Productos', path: '/admin/productos', icon: Package },
    { name: 'Categorías', path: '/admin/categorias', icon: Tags },
    { name: 'Ingredientes', path: '/admin/ingredientes', icon: Carrot },
    { name: 'Usuarios', path: '/admin/usuarios', icon: Users, requireAdmin: true },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-orange-500">FoodStore Panel</h2>
          <p className="text-gray-400 text-sm mt-1">Gestión de Inventario</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems
            // Filtramos: si requiere ser Admin, comprobamos el rol del usuario
            .filter(item => !item.requireAdmin || user?.rol === 'ADMIN')
            .map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
        </nav>

        {/* Perfil y Logout */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">{user?.nombre || 'Gestor'}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.rol}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 p-2">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content (Aquí se inyectan las páginas) */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}