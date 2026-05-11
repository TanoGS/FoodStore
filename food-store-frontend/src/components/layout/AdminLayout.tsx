import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
// 👇 1. Agregamos ClipboardList a las importaciones
import { Package, Tags, Carrot, LogOut, LayoutDashboard, Users, ClipboardList } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useEffect } from 'react';

export default function AdminLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  // 👇 2. Definimos qué roles pueden ver cada ítem del menú
  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/admin', 
      icon: LayoutDashboard, 
      roles: ['ADMIN', 'GESTOR_STOCK', 'GESTOR_PEDIDOS'] 
    },
    { 
      name: 'Productos', 
      path: '/admin/productos', 
      icon: Package, 
      roles: ['ADMIN', 'GESTOR_STOCK'] 
    },
    { 
      name: 'Categorías', 
      path: '/admin/categorias', 
      icon: Tags, 
      roles: ['ADMIN', 'GESTOR_STOCK'] 
    },
    { 
      name: 'Ingredientes', 
      path: '/admin/ingredientes', 
      icon: Carrot, 
      roles: ['ADMIN', 'GESTOR_STOCK'] 
    },
    { 
      name: 'Pedidos', 
      path: '/admin/gestor-pedidos', 
      icon: ClipboardList, 
      roles: ['ADMIN', 'GESTOR_PEDIDOS'] // 👈 Solo Admin y Gestor de Pedidos
    },
    { 
      name: 'Usuarios', 
      path: '/admin/usuarios', 
      icon: Users, 
      roles: ['ADMIN'] // 👈 Solo el Admin supremo
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6">
          <Link to="/" className="text-2xl font-black tracking-tighter text-orange-500">
            FOOD<span className="text-white">STORE</span>
          </Link>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            Panel de Control
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems
            // 👇 3. Filtramos dinámicamente según el rol del usuario logueado
            .filter(item => item.roles.includes(user?.rol || ''))
            .map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
        </nav>

        {/* Perfil y Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.nombre || 'Usuario'}</p>
              <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">
                {user?.rol.replace('_', ' ')}
              </p>
            </div>
            <button 
              onClick={handleLogout} 
              className="text-slate-500 hover:text-red-500 p-2 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}