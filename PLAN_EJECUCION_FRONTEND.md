# Plan de Ejecución: Frontend FoodStore - Vistas Multi-Rol y Control de Stock

**Duración estimada**: 5 días  
**Objetivo**: Implementar sistema de autenticación con 4 roles, dashboards específicos, y bloqueo automático de stock

---

## 📋 Resumen Ejecutivo

Implementar un sistema de autenticación multi-rol con vistas diferenciadas:
- **Cliente**: Compra productos, ve catálogo filtrado por stock
- **Gestor de Stock**: Administra cantidades de ingredientes
- **Gestor de Pedidos**: Controla estado de productos (activar/desactivar) y trazabilidad
- **Admin**: Accede a TODAS las funcionalidades de los otros 3 roles + panel consolidado

**Requisito crítico**: Sistema automático que detecta falta de stock de ingredientes y bloquea la compra en tiempo real.

---

## 🎯 Roles y Permisos

| Rol | Login | Ver Catálogo | Comprar | Gestor Stock | Gestor Pedidos | Admin |
|-----|-------|--------------|---------|--------------|----------------|-------|
| Cliente | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Gestor Stock | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Gestor Pedidos | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 📊 Estructura del Backend Actual

### Modelos Confirmados
```python
# Usuario (app/modules/usuario/models.py)
RolUsuario: CLIENTE, ADMIN, GESTOR_STOCK, GESTOR_PEDIDOS

# Producto (app/modules/producto/models.py)
- stock_disponible: int
- activo: bool
- Relación con Ingredientes via ProductoIngrediente

# Ingrediente (app/modules/ingrediente/models.py)
- nombre: str
- es_alergeno: bool
- (SIN campo de cantidad: PENDIENTE CONFIRMAR)

# Usuario (app/modules/usuario/models.py)
- Endpoint /usuarios/login disponible
```

---

## 🚀 Fases de Ejecución

### **Fase 1: Estructura Base - Autenticación y Routing (Día 1)**
**Duración**: 3-4 horas

#### Tarea 1.1: Crear página de Login
**Archivo**: `src/pages/auth/Login.tsx`
- Formulario con campos: email, password
- Estado de loading y error
- Integración con `useAuthStore().login()`
- Redireccionamiento automático a dashboard según rol tras login exitoso
- Link a registro (si aplica)

```tsx
// Pseudocódigo
const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    await login(email, password)
    // Redirigir según rol: CLIENTE -> /dashboard/cliente, etc.
  }
}
```

#### Tarea 1.2: Actualizar ProtectedRoute.tsx
**Archivo**: `src/app/router/ProtectedRoute.tsx`
- Cambiar firma para aceptar array de roles permitidos
- Validar que usuario tenga al menos uno de los roles requeridos
- Redirigir a `/login` si no autenticado
- Redirigir a `/dashboard/{rol}` si rol no permitido

```tsx
// Pseudocódigo
interface ProtectedRouteProps {
  requiredRoles: RolUsuario[]
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRoles, children }) => {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" />
  if (!requiredRoles.includes(user.rol)) return <Navigate to="/" />
  return children
}
```

#### Tarea 1.3: Agregar rutas protegidas en App.tsx
**Archivo**: `src/App.tsx`
- Reemplazar rutas placeholder por rutas protegidas
- Implementar redireccionamiento dinámico en Home según auth

```tsx
// Rutas a agregar:
<Route path="/dashboard/cliente" element={
  <ProtectedRoute requiredRoles={['CLIENTE', 'ADMIN']}>
    <ClienteDashboard />
  </ProtectedRoute>
} />

<Route path="/dashboard/gestor-stock" element={
  <ProtectedRoute requiredRoles={['GESTOR_STOCK', 'ADMIN']}>
    <GestorStockDashboard />
  </ProtectedRoute>
} />

<Route path="/dashboard/gestor-pedidos" element={
  <ProtectedRoute requiredRoles={['GESTOR_PEDIDOS', 'ADMIN']}>
    <GestorPedidosDashboard />
  </ProtectedRoute>
} />

<Route path="/dashboard/admin" element={
  <ProtectedRoute requiredRoles={['ADMIN']}>
    <AdminDashboard />
  </ProtectedRoute>
} />
```

#### Tarea 1.4: Extender authStore.ts
**Archivo**: `src/store/authStore.ts`
- Guardar `rol` en el store
- Agregar método `hasRole(role)` para validaciones
- Agregar método `canAccess(requiredRoles)` para verificar permisos
- (Opcional) Persistir auth state en localStorage

```typescript
// Agregar a interfaz AuthState:
rol?: RolUsuario
hasRole: (role: RolUsuario) => boolean
canAccess: (requiredRoles: RolUsuario[]) => boolean
```

---

### **Fase 2: Servicio de Stock e Ingredientes (Día 1-2)**
**Duración**: 3-4 horas

#### Tarea 2.1: Crear ingrediente.service.ts
**Archivo**: `src/services/ingrediente.service.ts`
- `obtenerTodos()` - lista todos los ingredientes con cantidad
- `obtenerPorId(id)` - detalle de un ingrediente específico
- `actualizarCantidad(id, cantidad)` - actualizar stock de ingrediente
- `verificarDisponibilidad(id)` - chequear si hay stock disponible

```typescript
class IngredienteService {
  async obtenerTodos() { /* GET /ingredientes */ }
  async obtenerPorId(id: number) { /* GET /ingredientes/{id} */ }
  async actualizarCantidad(id: number, cantidad: number) { /* PUT /ingredientes/{id} */ }
  async verificarDisponibilidad(id: number) { /* GET /ingredientes/{id}/disponible */ }
}
```

#### Tarea 2.2: Crear stock.service.ts
**Archivo**: `src/services/stock.service.ts`
- `verificarStockProducto(productoId)` - boolean ¿tiene stock el producto?
- `verificarStockIngredientes(productoId)` - array de ingredientes sin stock
- `obtenerProductosSinStock()` - lista de productos no disponibles
- `validarCompra(productoId)` - validación completa antes de comprar

```typescript
class StockService {
  async verificarStockProducto(id: number): Promise<boolean>
  async verificarStockIngredientes(id: number): Promise<string[]>
  async obtenerProductosSinStock(): Promise<Producto[]>
  async validarCompra(id: number): Promise<{ valido: boolean; razon?: string }>
}
```

#### Tarea 2.3: Actualizar producto.service.ts
**Archivo**: `src/services/producto.service.ts`
- Agregar `obtenerActivosConStock()` - solo productos con stock y activos
- Agregar `obtenerInactivos()` - para gestor de pedidos
- Mantener métodos existentes: `listarActivos()`, `obtenerPorId()`

---

### **Fase 3: Vista Cliente (Día 2)**
**Duración**: 4-5 horas

#### Tarea 3.1: Crear Dashboard Cliente
**Archivo**: `src/pages/dashboard/Cliente.tsx`
- Mostrar catálogo filtrado: solo productos con stock disponible
- Indicador visual "Sin Stock" para productos agotados (deshabilitados)
- Razón del bloqueo (ej: "Falta ingrediente: Carne")
- Link a "Mi Carrito"

```tsx
const ClienteDashboard = () => {
  const [productos, setProductos] = useState([])
  const [sinStock, setSinStock] = useState([])

  useEffect(() => {
    // Cargar productos con stock
    // Cargar productos sin stock
  }, [])
}
```

#### Tarea 3.2: Actualizar ProductCard.tsx
**Archivo**: `src/components/common/ProductCard.tsx`
- Prop `disponible: boolean`
- Prop `razonBloqueo?: string` (si no disponible)
- Deshabilitar botón "Agregar al Carrito" si sin stock
- Mostrar badge de estado usando `StockBadge.tsx`
- Tooltip con razón del bloqueo

```tsx
interface ProductCardProps {
  producto: Producto
  disponible: boolean
  razonBloqueo?: string
}
```

#### Tarea 3.3: Crear componente StockBadge.tsx
**Archivo**: `src/components/common/StockBadge.tsx`
- Badge reutilizable con estados: DISPONIBLE, BAJO STOCK, AGOTADO
- Colores: verde, amarillo, rojo
- Tooltip con cantidad disponible

```tsx
interface StockBadgeProps {
  estado: 'disponible' | 'bajo' | 'agotado'
  cantidad?: number
}
```

#### Tarea 3.4: Integración con carrito (si existe cartStore)
**Archivo**: `src/store/cartStore.ts`
- Validar stock antes de permitir agregar
- Mostrar alerta si producto queda sin stock
- Remover de carrito si stock = 0 mientras está en carrito

---

### **Fase 4: Vista Gestor de Stock (Día 2-3)**
**Duración**: 4-5 horas

#### Tarea 4.1: Crear GestorStock.tsx
**Archivo**: `src/pages/dashboard/GestorStock.tsx`
- Tabla de ingredientes con columnas:
  - Nombre
  - Cantidad actual (editable)
  - Estado (disponible/bajo/agotado)
  - Acciones (guardar/cancelar)
- Filtros: por nombre, estado
- Indicador visual: alerta si hay ingredientes agotados
- Botón "Guardar" tras editar cantidad

```tsx
const GestorStockDashboard = () => {
  const [ingredientes, setIngredientes] = useState([])
  const [filtro, setFiltro] = useState('')

  const handleActualizarCantidad = async (id: number, cantidad: number) => {
    // Llamar a ingrediente.service.actualizarCantidad()
    // Refrescar lista
  }
}
```

#### Tarea 4.2: Crear IngredienteForm.tsx
**Archivo**: `src/components/forms/IngredienteForm.tsx`
- Formulario para editar cantidad de ingrediente
- Validaciones: no negativos, máximo razonable (ej: 9999)
- Estados: idle, loading, success, error
- Manejo de errores con mensajes claros

```tsx
interface IngredienteFormProps {
  ingrediente: Ingrediente
  onSave: (cantidad: number) => Promise<void>
  onCancel: () => void
}
```

#### Tarea 4.3: Crear AlertaStock.tsx
**Archivo**: `src/components/common/AlertaStock.tsx`
- Banner que muestra ingredientes con stock bajo o agotado
- Reutilizable en múltiples vistas
- Dismissible (cerrar temporalmente)

```tsx
const AlertaStock = ({ ingredientesCriticos: Ingrediente[] }) => {
  // Mostrar banner con lista de ingredientes críticos
}
```

---

### **Fase 5: Vista Gestor de Pedidos (Día 3)**
**Duración**: 4-5 horas

#### Tarea 5.1: Crear pedido.service.ts
**Archivo**: `src/services/pedido.service.ts`
- `cambiarEstadoProducto(id, activo)` - activar/desactivar producto
- `obtenerTrazabilidad(id)` - historial y detalles del producto
- `obtenerProductosInactivos()` - listar desactivados
- `obtenerProductosActivos()` - listar activados

```typescript
class PedidoService {
  async cambiarEstadoProducto(id: number, activo: boolean): Promise<void>
  async obtenerTrazabilidad(id: number): Promise<Trazabilidad>
  async obtenerProductosInactivos(): Promise<Producto[]>
  async obtenerProductosActivos(): Promise<Producto[]>
}
```

#### Tarea 5.2: Crear GestorPedidos.tsx
**Archivo**: `src/pages/dashboard/GestorPedidos.tsx`
- Tabla de productos con columnas:
  - ID, Nombre, Precio, Stock disponible, Estado (Activo/Inactivo)
  - Acciones: Ver trazabilidad, Activar, Desactivar, Editar
- Filtros: por nombre, estado
- Modal/Drawer para mostrar trazabilidad detallada
- Confirmación antes de cambiar estado

```tsx
const GestorPedidosDashboard = () => {
  const [productos, setProductos] = useState([])
  const [filtro, setFiltro] = useState('')
  const [selectedProducto, setSelectedProducto] = useState(null)

  const handleCambiarEstado = async (id: number, activo: boolean) => {
    // Confirmación
    // Llamar a pedido.service.cambiarEstadoProducto()
    // Refrescar lista
  }

  const handleVerTrazabilidad = (id: number) => {
    // Abrir modal con detalles
  }
}
```

#### Tarea 5.3: Crear componente TrazabilidadModal.tsx
**Archivo**: `src/components/common/TrazabilidadModal.tsx`
- Mostrar detalles del producto:
  - Ingredientes y cantidades necesarias
  - Estado actual de cada ingrediente
  - Historial de cambios (si disponible)
  - Categorías asociadas

```tsx
interface TrazabilidadModalProps {
  productoId: number
  onClose: () => void
}
```

---

### **Fase 6: Vista Admin (Día 3-4)**
**Duración**: 5-6 horas

#### Tarea 6.1: Crear Admin.tsx
**Archivo**: `src/pages/dashboard/Admin.tsx`
- Layout con pestañas o sidebar navigation:
  - Dashboard general (resumen, alertas)
  - Gestión de Stock (reutilizar GestorStock)
  - Gestión de Pedidos (reutilizar GestorPedidos)
  - Gestión de Productos
  - (Opcional) Gestión de Clientes
- Resumen general: total productos, ingredientes críticos, productos inactivos

```tsx
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  
  return (
    <div>
      <Tabs>
        <Tab label="Dashboard"><DashboardGeneral /></Tab>
        <Tab label="Stock"><GestorStockDashboard /></Tab>
        <Tab label="Pedidos"><GestorPedidosDashboard /></Tab>
        <Tab label="Productos"><AdminProductos /></Tab>
      </Tabs>
    </div>
  )
}
```

#### Tarea 6.2: Crear AdminProductos.tsx
**Archivo**: `src/pages/dashboard/AdminProductos.tsx`
- CRUD completo de productos:
  - Listar productos (con filtros)
  - Crear nuevo producto
  - Editar producto (nombre, precio, categoría, ingredientes)
  - Eliminar/desactivar producto
- Tabla con acciones
- Modal/Drawer para crear/editar

```tsx
const AdminProductos = () => {
  const [productos, setProductos] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedProducto, setSelectedProducto] = useState(null)
}
```

#### Tarea 6.3: Crear producto.service.ts métodos adicionales
**Archivo**: `src/services/producto.service.ts`
- Agregar: `crear(producto)`, `actualizar(id, producto)`, `eliminar(id)`
- Agregar: `obtenerConIngredientes(id)` - para edición

---

### **Fase 7: Componentes Comunes y UX (Día 4)**
**Duración**: 3-4 horas

#### Tarea 7.1: Actualizar Navbar.tsx
**Archivo**: `src/components/layout/Navbar.tsx`
- Mostrar nombre de usuario y rol actual
- Links dinámicos según rol:
  - Cliente: Catálogo, Mi Carrito, Mi Cuenta
  - Gestor Stock: Gestor Stock, Catálogo
  - Gestor Pedidos: Gestor Pedidos, Catálogo
  - Admin: Dashboard, Stock, Pedidos, Productos
- Botón Logout con confirmación
- (Opcional) Notificación de ingredientes críticos

```tsx
const Navbar = () => {
  const { user, logout, hasRole } = useAuthStore()

  const getNavLinks = () => {
    if (hasRole('CLIENTE')) return [...]
    if (hasRole('GESTOR_STOCK')) return [...]
    // etc...
  }
}
```

#### Tarea 7.2: Actualizar Home.tsx
**Archivo**: `src/pages/Home.tsx`
- Si NO autenticado:
  - Hero con descripción de la app
  - CTA: "Inicia Sesión" → `/login`
  - Info sobre categorías/productos
- Si autenticado:
  - CTA según rol:
    - Cliente: "Ir al Catálogo" → `/dashboard/cliente`
    - Gestor Stock: "Gestor de Stock" → `/dashboard/gestor-stock`
    - etc.
  - Resumen de actividad reciente (si aplica)

```tsx
const Home = () => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <LandingPage />
  }

  return <DashboardRedirect rol={user.rol} />
}
```

#### Tarea 7.3: Crear componente DashboardRedirect
**Archivo**: `src/components/DashboardRedirect.tsx`
- Componente que redirige automáticamente a dashboard según rol
- O muestra página de bienvenida con links a funcionalidades

#### Tarea 7.4: Mejorar estilos y temas
**Archivos**: `src/App.css`, `tailwind.config.js`
- Asegurar consistencia de colores para estados de stock
- Definir paleta: disponible=verde, bajo=amarillo, agotado=rojo
- Responsive design para todas las nuevas vistas

---

### **Fase 8: Integración y Testing (Día 4-5)**
**Duración**: 4-6 horas

#### Tarea 8.1: Validación de Rutas Protegidas
- [ ] Acceder a `/dashboard/gestor-stock` sin autenticación → redirige a `/login`
- [ ] Login como Cliente → accede a `/dashboard/cliente`, rechaza `/dashboard/gestor-stock`
- [ ] Login como Admin → accede a TODAS las rutas
- [ ] Logout → redirige a Home

#### Tarea 8.2: Testing de Stock en Tiempo Real
- [ ] Producto con stock = 5 aparece en Catálogo
- [ ] Cambiar stock a 0 en Gestor Stock → Producto se deshabilita inmediatamente
- [ ] Intentar agregar al carrito producto sin stock → mostrar alerta
- [ ] Refrescar página → persiste cambios de stock

#### Tarea 8.3: Testing de Gestión de Productos
- [ ] Gestor Pedidos desactiva producto → desaparece de Catálogo
- [ ] Gestor Pedidos activa producto → reaparece en Catálogo
- [ ] Gestor Stock edita ingrediente → afecta disponibilidad de productos

#### Tarea 8.4: Testing de Roles y Permisos
```
CLIENTE:
  ✅ Ver Home
  ✅ Login
  ✅ Ver Catálogo (solo con stock)
  ✅ Agregar a carrito
  ✅ Ir a /dashboard/cliente
  ❌ Acceder a /dashboard/gestor-stock
  ❌ Acceder a /dashboard/gestor-pedidos
  ❌ Acceder a /dashboard/admin

GESTOR_STOCK:
  ✅ Ver Home
  ✅ Login
  ✅ Ver Catálogo (información)
  ✅ Ir a /dashboard/gestor-stock
  ✅ Editar cantidades de ingredientes
  ❌ Comprar productos
  ❌ Acceder a /dashboard/gestor-pedidos (sin ser Admin)

GESTOR_PEDIDOS:
  ✅ Ver Home
  ✅ Login
  ✅ Ver Catálogo
  ✅ Ir a /dashboard/gestor-pedidos
  ✅ Activar/desactivar productos
  ✅ Ver trazabilidad
  ❌ Acceder a /dashboard/gestor-stock (sin ser Admin)

ADMIN:
  ✅ Acceder a TODAS las rutas
  ✅ Todas las funcionalidades de los otros 3 roles
```

#### Tarea 8.5: Testing de Flujo Completo
1. **Flujo de Compra Normal**:
   - Login como Cliente
   - Navegar a Catalogo
   - Ver productos con stock
   - Agregar a carrito
   - Checkout

2. **Flujo de Bloqueo por Stock**:
   - Login como Cliente
   - Ver producto con stock = 5
   - En otra ventana: Login como Gestor Stock
   - Cambiar cantidad a 0
   - Cliente refresca Catalogo → producto deshabilitado

3. **Flujo de Gestión**:
   - Admin accede a Gestor Stock
   - Edita cantidades
   - Admin accede a Gestor Pedidos
   - Desactiva un producto
   - Cliente refresca Catalogo → cambios reflejados

---

## 📁 Estructura de Archivos - Resumen

### Archivos a CREAR
```
src/
├── pages/
│   ├── auth/
│   │   └── Login.tsx (nueva)
│   └── dashboard/
│       ├── Cliente.tsx (nueva)
│       ├── GestorStock.tsx (nueva)
│       ├── GestorPedidos.tsx (nueva)
│       ├── Admin.tsx (nueva)
│       ├── AdminProductos.tsx (nueva)
│       └── index.tsx (nueva - redireccionamiento)
├── services/
│   ├── ingrediente.service.ts (nueva)
│   ├── stock.service.ts (nueva)
│   └── pedido.service.ts (nueva)
├── components/
│   ├── common/
│   │   ├── StockBadge.tsx (nueva)
│   │   ├── AlertaStock.tsx (nueva)
│   │   └── TrazabilidadModal.tsx (nueva)
│   └── forms/
│       └── IngredienteForm.tsx (nueva)
```

### Archivos a MODIFICAR
```
src/
├── app/
│   └── router/
│       └── ProtectedRoute.tsx (actualizar)
├── App.tsx (actualizar)
├── pages/
│   ├── Home.tsx (actualizar)
│   └── client/
│       └── Catalogo.tsx (actualizar)
├── services/
│   └── producto.service.ts (actualizar)
├── store/
│   └── authStore.ts (actualizar)
└── components/
    ├── common/
    │   └── ProductCard.tsx (actualizar)
    └── layout/
        └── Navbar.tsx (actualizar)
```

---

## 🔄 Validación de Requisitos

| Requisito | Estado | Verificación |
|-----------|--------|--------------|
| Login funcional | 📋 Fase 1 | Crear user, login, redirige a dashboard |
| Home dinámico | 📋 Fase 7 | Si no auth → mostrar login, si auth → mostrar dashboard según rol |
| Vista Cliente | 📋 Fase 3 | Catalogo filtrado, solo con stock, botón comprar |
| Vista Gestor Stock | 📋 Fase 4 | Tabla editable de ingredientes, alerta si crítico |
| Vista Gestor Pedidos | 📋 Fase 5 | Tabla de productos, activar/desactivar, ver trazabilidad |
| Vista Admin | 📋 Fase 6 | Pestañas con todas las funciones de otros roles |
| Bloqueo automático | 📋 Fases 2-3 | Stock = 0 → deshabilitar producto en tiempo real |
| Detección de ingredientes | 📋 Fase 2 | Verificar ingredientes faltantes antes de compra |
| Persistencia de cambios | 📋 Fase 8 | Editar stock → refrescar página → cambios persisten |

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript
- **Enrutamiento**: React Router v6
- **Estado Global**: Zustand
- **HTTP Client**: Axios
- **Estilos**: Tailwind CSS
- **Formularios**: (Usar componentes HTML básicos o React Hook Form)

---

## 📌 Consideraciones Importantes

1. **Validación en Dos Niveles**:
   - Frontend: Deshabilitar botones, mostrar alertas inmediatas
   - Backend: Validar en la API (seguridad final)

2. **Stock en Tiempo Real**:
   - Refrescar lista de productos al navegar a Catalogo
   - Considerar WebSockets para actualizaciones en vivo (Fase 9)
   - O polling cada 30 segundos en vistas críticas

3. **Persistencia de Auth**:
   - Guardar token en localStorage (si aplica)
   - Restaurar sesión al recargar página

4. **Manejo de Errores**:
   - Toast/Snackbar para feedback visual
   - Mensajes claros sobre por qué un producto está bloqueado

5. **Performance**:
   - Lazy loading de dashboards
   - Caching de datos (productos, categorías)
   - Pagination en tablas grandes

6. **Responsiveness**:
   - Mobile-first approach
   - Tablas adaptables en móvil (cards en lugar de tablas)

---

## 📚 Checklist de Inicio Rápido

- [ ] Leer este documento completo
- [ ] Confirmar estructura de respuesta del login backend
- [ ] Confirmar endpoints de ingrediente disponibles
- [ ] Confirmar estructura de modelos en backend
- [ ] Crear rama git: `feature/multi-role-dashboards`
- [ ] Instalar dependencias faltantes (si aplica)
- [ ] Configurar environment variables
- [ ] Iniciar backend (uvicorn)
- [ ] Iniciar frontend (npm run dev)

---

## 🎬 Próximos Pasos Post-Plan

1. Confirmar endpoints del backend necesarios
2. Definir "stock bajo" (ej: < 5 unidades)
3. Definir timeout para refresh de stock (ej: cada 30s)
4. Crear estructura de auth token (JWT, sesión, etc.)
5. Definir estilos/colores para badges de stock
6. Planificar notificaciones (opcional: push, email)
7. Implementar logging y analytics

---

**Versión**: 1.0  
**Fecha**: Mayo 1, 2026  
**Estado**: 🚀 Listo para inicio de implementación
