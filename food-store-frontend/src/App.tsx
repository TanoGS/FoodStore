import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';

import Login from './pages/auth/Login';
import AdminLayout from './components/layout/AdminLayout';
import ProductosAdmin from './pages/admin/ProductosAdmin';
import CategoriasAdmin from './pages/admin/CategoriasAdmin';
import IngredientesAdmin from './pages/admin/IngredientesAdmin';
import PanelUsuarios from './pages/admin/PanelUsuarios';
import Register from './pages/auth/Register';
import MisDirecciones from './pages/direcciones/MisDirecciones';
import GestorPedidos from './pages/admin/GestorPedidos';



export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* --- RUTAS PÚBLICAS (Cliente) --- */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="carrito" element={<div className="p-10 text-center text-2xl">Carrito en construcción 🛒</div>} />
          <Route path="/registro" element={<Register />} />
          <Route path="/mis-direcciones" element={<MisDirecciones />} />
        </Route>

        <Route path="login" element={<Login />} />

        {/* --- RUTAS PROTEGIDAS (Admin / Gestor) --- */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<div className="text-2xl font-bold">Bienvenido al Dashboard de Gestión</div>} />
          <Route path="productos" element={<ProductosAdmin />} />
          <Route path="categorias" element={<CategoriasAdmin />} />
          <Route path="ingredientes" element={<IngredientesAdmin />} />
          <Route path="gestor-pedidos" element={<GestorPedidos />} />

          <Route path="usuarios" element={<PanelUsuarios />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}