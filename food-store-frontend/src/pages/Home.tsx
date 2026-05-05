import { useState, useEffect } from 'react';
import { ShoppingBag, Plus } from 'lucide-react';
import { ProductoService } from '../services/producto.service';
import { useCartStore } from '../store/cartStore';

export default function Home() {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ¡Traemos la varita mágica para agregar al carrito!
  const addItem = useCartStore(state => state.addItem);

 useEffect(() => {
    const fetchProductos = async () => {
      try {    
        const data = await ProductoService.listarActivos();
        
        // Lo guardamos en el estado (por si acaso filtramos los activos, 
        // aunque tu backend ya debería traer solo los activos)
        setProductos(data.filter((p: any) => p.activo !== false));
      } catch (error) {
        console.error("Error al cargar el catálogo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  const handleAgregarAlCarrito = (producto: any) => {
    // Lo mapeamos para que coincida exactamente con lo que espera el CartStore
    addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio_base: producto.precio_base,
      imagen_url: producto.imagen_url
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* --- HERO SECTION --- */}
      <div className="bg-slate-900 text-white py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
          El sabor que estabas buscando 🍔
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Pide tus platos favoritos en segundos y recíbelos calentitos en la puerta de tu casa.
        </p>
      </div>

      {/* --- CATÁLOGO --- */}
      <div className="max-w-6xl mx-auto p-6 md:p-8 -mt-8">
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : productos.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm text-center">
            <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-700">No hay productos disponibles</h2>
            <p className="text-slate-500 mt-2">Vuelve a visitarnos más tarde.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productos.map((producto) => (
              <div 
                key={producto.id} 
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-slate-100 flex flex-col"
              >
                {/* Imagen del Producto */}
                <div className="h-48 bg-slate-200 relative overflow-hidden group">
                  <img 
                    src={producto.imagen_url || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=500"} 
                    alt={producto.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Etiqueta de precio superpuesta */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-slate-900 font-black px-3 py-1 rounded-full shadow-sm">
                    ${producto.precio_base}
                  </div>
                </div>

                {/* Info y Botón */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 leading-tight mb-2">
                      {producto.nombre}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                      {producto.descripcion || "Un delicioso producto preparado con los mejores ingredientes."}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleAgregarAlCarrito(producto)}
                    className="w-full bg-orange-100 hover:bg-orange-600 text-orange-700 hover:text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}