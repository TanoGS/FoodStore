import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const setLogin = useAuthStore((state) => state.setLogin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Llamamos al backend. La respuesta AHORA es el usuario directamente.
      const usuario = await AuthService.login(email, password);

      // 2. Guardamos en Zustand. 
      // Como ya no hay token manual, le pasamos un string vacío o null al primer parámetro.
      // (El navegador se encarga de la Cookie automáticamente).
      setLogin("", usuario); 

      // 3. Redirigimos según el rol.
      // Ahora revisamos si dentro de su lista de roles está el "ADMIN"
      // Nota: Si tus roles vienen como objetos anidados en lugar de strings, 
      // podrías necesitar: usuario.roles?.some(r => r.rol_codigo === 'ADMIN')
      const esAdmin = usuario.roles?.includes('ADMIN') || 
                      usuario.roles?.some((r: any) => r.rol_codigo === 'ADMIN' || r === 'ADMIN');

      if (esAdmin) {
        navigate('/'); // Redirige al panel de administrador 
      } else {
        navigate('/'); // Redirige a la tienda para el cliente normal
      }
      
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401 || err.response?.status === 400) {
        setError('Credenciales incorrectas. Intenta de nuevo.');
      } else {
        setError('Ocurrió un error al intentar iniciar sesión.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Bienvenido de nuevo</h2>
          <p className="text-gray-500 mt-2">Ingresa a tu cuenta para continuar</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-colors disabled:bg-orange-400 flex justify-center items-center"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* REGISTRO */}
        <div className="mt-8 text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{' '}
          <Link to="/registro" className="font-bold text-orange-600 hover:text-orange-500 transition-colors">
            Regístrate aquí
          </Link>
        </div>

      </div>
    </div>
  );
}