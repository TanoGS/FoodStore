import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, Calculator, ArrowRight } from 'lucide-react';
import { CatalogoService } from '../../services/catalogo.service';

interface ProductoModalProps {
  productoEditar?: any | null;
  onClose: () => void;
  onSave: (payload: any) => void;
}

export default function ProductoModal({ productoEditar, onClose, onSave }: ProductoModalProps) {
  // --- Catálogos Maestros ---
  const [categoriasDB, setCategoriasDB] = useState<any[]>([]);
  const [ingredientesDB, setIngredientesDB] = useState<any[]>([]);
  const [loadingDatos, setLoadingDatos] = useState(true);

  // --- Estado del Producto ---
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [stock, setStock] = useState<number | ''>('');
  const [activo, setActivo] = useState(true);
  const [categoriaIds, setCategoriaIds] = useState<number[]>([]);
  
  // Finanzas
  const [margenGanancia, setMargenGanancia] = useState<number>(90); // 90% por defecto
  const [precioManual, setPrecioManual] = useState<number | ''>('');

  // Receta (Lista de objetos: { ingrediente_id, cantidad, es_removible, _costo_unitario, _nombre })
  const [receta, setReceta] = useState<any[]>([]);

  // Mini-formulario temporal para agregar ingrediente a la receta
  const [ingSeleccionado, setIngSeleccionado] = useState('');
  const [cantidadReq, setCantidadReq] = useState('');
  const [esRemovible, setEsRemovible] = useState(false);

  useEffect(() => {
    cargarDatosMaestros();
  }, []);

  const cargarDatosMaestros = async () => {
    try {
      const [cats, ings] = await Promise.all([
        CatalogoService.getCategorias(),
        CatalogoService.getIngredientes()
      ]);
      setCategoriasDB(cats);
      setIngredientesDB(ings);
      
      // Si estamos editando, mapeamos los datos al estado
      if (productoEditar) {
        setNombre(productoEditar.nombre || '');
        setDescripcion(productoEditar.descripcion || '');
        setImagenUrl(productoEditar.imagen_url || '');
        setStock(productoEditar.stock ?? '');
        setActivo(productoEditar.activo !== false);
        setMargenGanancia(productoEditar.margen_ganancia ?? 90);
        setPrecioManual(productoEditar.precio ?? '');
        
        if (productoEditar.categorias) {
          setCategoriaIds(productoEditar.categorias.map((c: any) => c.id));
        }

        // Reconstruimos la receta visual
        if (productoEditar.ingredientes_enlaces) {
          const recetaFormateada = productoEditar.ingredientes_enlaces.map((enlace: any) => {
            const ingBase = ings.find((i: any) => i.id === enlace.ingrediente_id);
            return {
              ingrediente_id: enlace.ingrediente_id,
              cantidad_requerida: enlace.cantidad_requerida,
              es_removible: enlace.es_removible,
              _nombre: ingBase?.nombre || 'Desconocido',
              _costo_unitario: ingBase?.costo_unitario || 0,
              _unidad: ingBase?.unidad_medida || ''
            };
          });
          setReceta(recetaFormateada);
        }
      }
    } catch (error) {
      console.error("Error cargando catálogos:", error);
    } finally {
      setLoadingDatos(false);
    }
  };

  // --- Lógica del Escandallo (Matemáticas en vivo) ---
  const costoTotalProduccion = useMemo(() => {
    return receta.reduce((acc, item) => acc + (item.cantidad_requerida * item._costo_unitario), 0);
  }, [receta]);

  const precioSugerido = useMemo(() => {
    return costoTotalProduccion * (1 + (margenGanancia / 100));
  }, [costoTotalProduccion, margenGanancia]);


  // --- Handlers de UI ---
  const toggleCategoria = (id: number) => {
    setCategoriaIds(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const agregarIngredienteAReceta = () => {
    if (!ingSeleccionado || !cantidadReq) return;
    
    const ingBase = ingredientesDB.find(i => i.id === Number(ingSeleccionado));
    if (!ingBase) return;

    const existeIdx = receta.findIndex(r => r.ingrediente_id === ingBase.id);
    
    if (existeIdx >= 0) {
      const nuevaReceta = [...receta];
      nuevaReceta[existeIdx].cantidad_requerida += Number(cantidadReq);
      setReceta(nuevaReceta);
    } else {
      setReceta([...receta, {
        ingrediente_id: ingBase.id,
        cantidad_requerida: Number(cantidadReq),
        es_removible: esRemovible,
        _nombre: ingBase.nombre,
        _costo_unitario: ingBase.costo_unitario,
        _unidad: ingBase.unidad_medida
      }]);
    }

    setIngSeleccionado('');
    setCantidadReq('');
    setEsRemovible(false);
  };

  const quitarDeReceta = (ingId: number) => {
    setReceta(receta.filter(r => r.ingrediente_id !== ingId));
  };

  // --- Guardar Final ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoriaIds.length === 0) {
      alert("Debes seleccionar al menos una categoría.");
      return;
    }
    
    const recetaLimpia = receta.map(r => ({
      ingrediente_id: r.ingrediente_id,
      cantidad_requerida: r.cantidad_requerida,
      es_removible: r.es_removible
    }));

    const payload = {
      nombre,
      descripcion: descripcion || null,
      imagen_url: imagenUrl || null,
      stock: stock === '' ? 0 : Number(stock),
      activo,
      categoria_ids: categoriaIds,
      margen_ganancia: Number(margenGanancia),
      precio_manual: precioManual === '' ? null : Number(precioManual),
      receta: recetaLimpia
    };

    onSave(payload);
  };

  if (loadingDatos) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex items-center gap-3">
          <div className="animate-spin h-5 w-5 border-2 border-orange-600 border-t-transparent rounded-full"></div>
          <span className="font-bold text-slate-700">Cargando base de datos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-900 text-white">
          <h3 className="font-black text-xl flex items-center gap-2">
            {productoEditar ? 'Modificar Plato y Receta' : 'Creación de Nuevo Plato'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-red-400 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cuerpo Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* SECCIÓN 1: Info Básica */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4">1. Identidad del Plato</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nombre Comercial *</label>
                  <input type="text" required value={nombre} onChange={e => setNombre(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Stock Fijo (Opcional)</label>
                  {/* 👇 ACÁ ESTÁ LA CORRECCIÓN APLICADA 👇 */}
                  <input type="number" value={stock} onChange={e => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Dejar vacío si es ilimitado" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Categorías del Menú *</label>
                  <div className="flex flex-wrap gap-2">
                    {categoriasDB.map(cat => (
                      <button type="button" key={cat.id} onClick={() => toggleCategoria(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all border ${
                          categoriaIds.includes(cat.id) 
                            ? 'bg-orange-100 border-orange-500 text-orange-700 shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}>
                        {cat.nombre}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Descripción</label>
                  <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={2}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none" />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: ESCANDALLO (RECETA) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4">2. Hoja de Receta (Escandallo)</h4>
              
              {/* Buscador de Insumos */}
              <div className="flex flex-wrap items-end gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Insumo / Ingrediente</label>
                  <select value={ingSeleccionado} onChange={e => setIngSeleccionado(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none">
                    <option value="">Seleccionar insumo...</option>
                    {ingredientesDB.map(ing => (
                      <option key={ing.id} value={ing.id}>{ing.nombre} (${ing.costo_unitario}/{ing.unidad_medida})</option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Cantidad Usada</label>
                  <input type="number" step="0.001" value={cantidadReq} onChange={e => setCantidadReq(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none" placeholder="Ej: 0.150" />
                </div>
                <div className="flex items-center gap-2 pb-2">
                  <input type="checkbox" id="removible" checked={esRemovible} onChange={e => setEsRemovible(e.target.checked)} className="w-4 h-4 text-orange-600 rounded" />
                  <label htmlFor="removible" className="text-xs font-bold text-slate-600">Cliente puede quitarlo</label>
                </div>
                <button type="button" onClick={agregarIngredienteAReceta} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition">
                  Agregar
                </button>
              </div>

              {/* Tabla de Receta Actual */}
              {receta.length > 0 ? (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="pb-2">Ingrediente</th>
                      <th className="pb-2">Cantidad</th>
                      <th className="pb-2">Opciones</th>
                      <th className="pb-2 text-right">Costo Parcial</th>
                      <th className="pb-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {receta.map((r, idx) => (
                      <tr key={idx}>
                        <td className="py-3 font-bold text-slate-700">{r._nombre}</td>
                        <td className="py-3 text-slate-600">{r.cantidad_requerida} <span className="text-xs text-slate-400">{r._unidad}</span></td>
                        <td className="py-3">
                          {r.es_removible ? <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">REMOVIBLE</span> : <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-bold">FIJO</span>}
                        </td>
                        <td className="py-3 text-right font-medium text-slate-700">
                          ${(r.cantidad_requerida * r._costo_unitario).toFixed(2)}
                        </td>
                        <td className="py-3 text-right">
                          <button type="button" onClick={() => quitarDeReceta(r.ingrediente_id)} className="text-slate-300 hover:text-red-500"><X className="w-4 h-4 inline"/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                  La receta está vacía. Agrega ingredientes para calcular el costo.
                </div>
              )}
            </div>

            {/* SECCIÓN 3: FINANZAS */}
            <div className="bg-slate-900 p-6 rounded-2xl shadow-sm text-white">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calculator className="w-4 h-4" /> 3. Proyección Financiera
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <div className="text-slate-400 text-xs font-bold mb-1">COSTO DE PRODUCCIÓN</div>
                  <div className="text-2xl font-black text-white">${costoTotalProduccion.toFixed(2)}</div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                      <span>Margen de Ganancia (%)</span>
                      <span className="text-orange-400">{margenGanancia}%</span>
                    </label>
                    <input type="range" min="0" max="300" step="5" value={margenGanancia} onChange={e => setMargenGanancia(Number(e.target.value))}
                      className="w-full accent-orange-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">O Forzar Precio Manual ($)</label>
                    {/* 👇 ACÁ ESTÁ LA CORRECCIÓN APLICADA 👇 */}
                    <input type="number" value={precioManual} onChange={e => setPrecioManual(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-white outline-none focus:border-orange-500" placeholder="Ej: 5000" />
                  </div>
                </div>

                <div className="bg-orange-500 p-4 rounded-xl shadow-lg shadow-orange-500/20 text-right flex flex-col justify-center h-full">
                  <div className="text-orange-100 text-xs font-bold mb-1">PRECIO DE VENTA PÚBLICO</div>
                  <div className="text-3xl font-black text-white flex items-center justify-end gap-2">
                    {precioManual !== '' ? (
                      <span className="line-through text-orange-300 text-lg">${precioSugerido.toFixed(2)}</span>
                    ) : null}
                    ${precioManual !== '' ? Number(precioManual).toFixed(2) : precioSugerido.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer / Botones */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="activoProd" checked={activo} onChange={e => setActivo(e.target.checked)} className="w-5 h-5 text-green-600 rounded" />
            <label htmlFor="activoProd" className="font-bold text-slate-700 cursor-pointer">Visible en Tienda</label>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition">
              Cancelar
            </button>
            <button form="product-form" type="submit" className="px-6 py-2.5 bg-orange-600 text-white font-black rounded-xl hover:bg-orange-700 transition shadow-lg shadow-orange-600/20 flex items-center gap-2">
              Guardar Plato <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}