import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { type Producto } from '../../types/producto.type';
import { type Categoria } from '../../types/categoria.type';

import { CategoriaService } from '../../services/categoria.service';
import { IngredienteService } from '../../services/ingrediente.service'; 
import { type Ingrediente } from '../../types/ingrediente.type';


interface ProductoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productoPayload: any, ingredienteIds: number[]) => void; // <-- Modificamos para pasar los ingredientes separados
  productoEditar?: Producto | null;
}

export default function ProductoModal({ isOpen, onClose, onSave, productoEditar }: ProductoModalProps) {
  const [categoriasDB, setCategoriasDB] = useState<Categoria[]>([]);
  //  estado para los ingredientes de la base de datos
  const [ingredientesDB, setIngredientesDB] = useState<Ingrediente[]>([]);
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio_base: 0,
    stock_disponible: 0,
    imagen_url: '',
    es_personalizable: false,
    activo: true,
    categoria_id: '', 
    ingrediente_ids: [] as number[], // <-- Guarda los IDs de ingredientes seleccionados
  });

  // Cargar categorías e ingredientes al abrir el modal
  useEffect(() => {
    if (isOpen) {
      CategoriaService.listarConProductos().then(data => setCategoriasDB(data));
      // Asumimos que tienes un método listar() en tu IngredienteService
      IngredienteService.listarTodos().then(data => setIngredientesDB(data));
    }
  }, [isOpen]);

  // Llenar el formulario al editar
  useEffect(() => {
    if (productoEditar) {
      setFormData({
        nombre: productoEditar.nombre,
        descripcion: productoEditar.descripcion || '',
        precio_base: productoEditar.precio_base,
        stock_disponible: productoEditar.stock_disponible,
        imagen_url: productoEditar.imagen_url || '',
        es_personalizable: productoEditar.es_personalizable,
        activo: productoEditar.activo,
        categoria_id: productoEditar.categorias && productoEditar.categorias.length > 0 
          ? productoEditar.categorias[0].id.toString() 
          : '',
        // Si el producto ya tiene ingredientes, los pre-seleccionamos
        ingrediente_ids: productoEditar.ingredientes
          ? productoEditar.ingredientes.map((ing: any) => ing.id) 
          : [],
      });
    } else {
      setFormData({
        nombre: '', descripcion: '', precio_base: 0, stock_disponible: 0,
        imagen_url: '', es_personalizable: false, activo: true, categoria_id: '',
        ingrediente_ids: [],
      });
    }
  }, [productoEditar, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoria_id) {
      alert("Por favor, selecciona una categoría.");
      return;
    }

    // Preparamos el payload principal del producto
    const payloadProducto = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precio_base: formData.precio_base,
      stock_disponible: formData.stock_disponible,
      imagen_url: formData.imagen_url,
      es_personalizable: formData.es_personalizable,
      activo: formData.activo,
      categoria_ids: [parseInt(formData.categoria_id)],
    };

    // Le pasamos el producto Y la lista de ingredientes al componente padre
    onSave(payloadProducto, formData.ingrediente_ids);
  };

  // Función para manejar el tick de los checkboxes
  const handleIngredienteToggle = (ingredienteId: number) => {
    setFormData(prev => {
      const ids = prev.ingrediente_ids;
      if (ids.includes(ingredienteId)) {
        return { ...prev, ingrediente_ids: ids.filter(id => id !== ingredienteId) }; // Lo quitamos
      } else {
        return { ...prev, ingrediente_ids: [...ids, ingredienteId] }; // Lo agregamos
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-800">
            {productoEditar ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Le agregamos overflow-y-auto para que si hay muchos ingredientes, se pueda scrollear */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input required type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full p-2.5 border rounded-lg" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} className="w-full p-2.5 border rounded-lg" rows={2}></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
              <input required type="number" value={formData.precio_base} onChange={(e) => setFormData({...formData, precio_base: Number(e.target.value)})} className="w-full p-2.5 border rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input required type="number" value={formData.stock_disponible} onChange={(e) => setFormData({...formData, stock_disponible: Number(e.target.value)})} className="w-full p-2.5 border rounded-lg" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select required value={formData.categoria_id} onChange={(e) => setFormData({...formData, categoria_id: e.target.value})} className="w-full p-2.5 border rounded-lg bg-white">
                <option value="" disabled>-- Selecciona una categoría --</option>
                {categoriasDB.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>

            {/* 👇 NUEVA SECCIÓN DE INGREDIENTES (CHECKBOXES) 👇 */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ingredientes Asociados</label>
              <div className="border rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50 grid grid-cols-2 gap-2">
                {ingredientesDB.length === 0 ? (
                  <p className="text-sm text-gray-500 col-span-2">No hay ingredientes cargados en el sistema.</p>
                ) : (
                  ingredientesDB.map((ing) => (
                    <label key={ing.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                      <input 
                        type="checkbox" 
                        checked={formData.ingrediente_ids.includes(ing.id)}
                        onChange={() => handleIngredienteToggle(ing.id)}
                        className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500" 
                      />
                      <span className="text-sm text-gray-700 truncate" title={ing.nombre}>
                        {ing.nombre} {ing.es_alergeno && <span className="text-red-500 font-bold ml-1" title="Alérgeno">⚠️</span>}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="col-span-2 flex gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.activo} onChange={(e) => setFormData({...formData, activo: e.target.checked})} className="w-5 h-5 text-orange-600 rounded" />
                <span className="text-sm text-gray-700">Producto Activo</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 border-t pt-6">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition">Cancelar</button>
            <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl font-bold transition">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}