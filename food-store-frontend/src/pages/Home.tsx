import { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Utensils } from 'lucide-react';
import { CategoriaService } from '../services/categoria.service'; // Asegúrate de importar tu servicio
import { useCartStore } from '../store/cartStore';

interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio_base: number;
  imagen_url?: string | null;
}

interface Categoria {
  id: number;
  nombre: string;
  productos?: Producto[];
}

export default function Home() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await CategoriaService.listarConProductos();
        setCategorias(data);
      } catch (error) {
        console.error("Error al cargar el menú:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const handleAgregarAlCarrito = (producto: Producto, categoriaNombre: string) => {
    addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio_base: producto.precio_base,
      imagen_url: producto.imagen_url,
      categoria: categoriaNombre 
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Banner Principal */}
      <div className="bg-slate-900 text-white py-8 px-4 text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
          Nuestro Menú 🍕
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Explora nuestras especialidades preparadas al momento.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {categorias.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-700">No hay productos disponibles</h2>
          </div>
        ) : (
          <div className="space-y-16">
            {categorias.map((cat) => (
              <section key={cat.id}>
                {/* Título de la Categoría */}
                <div className="flex items-center gap-4 mb-8 border-b border-slate-200 pb-4">
                  <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
                    {cat.nombre}
                  </h2>
                  <span className="bg-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">
                    {cat.productos?.length || 0} ítems
                  </span>
                </div>

                {/* Grilla de Productos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {cat.productos?.map((producto: Producto) => (
                    <div key={producto.id} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                      <div className="h-48 overflow-hidden relative">
                        <img 
                          src={producto.imagen_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500"} 
                          alt={producto.nombre}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full font-black text-slate-900 shadow-sm">
                          ${producto.precio_base}
                        </div>
                      </div>
                      
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{producto.nombre}</h3>
                        <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-1">
                          {producto.descripcion || "Ingredientes frescos y sabor inigualable."}
                        </p>
                        <button
                          onClick={() => handleAgregarAlCarrito(producto, cat.nombre)}
                          className="w-full bg-slate-900 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-slate-200"
                        >
                          <Plus className="w-5 h-5" /> Agregar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}