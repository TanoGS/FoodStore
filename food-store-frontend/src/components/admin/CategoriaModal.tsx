import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { type Categoria } from '../../types/categoria.type';

interface CategoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoria: any) => void;
  categoriaEditar?: Categoria | null;
}

export default function CategoriaModal({ isOpen, onClose, onSave, categoriaEditar }: CategoriaModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
  });

  useEffect(() => {
    if (categoriaEditar) {
      setFormData({
        nombre: categoriaEditar.nombre,
        descripcion: categoriaEditar.descripcion || '',
      });
    } else {
      setFormData({ nombre: '', descripcion: '' });
    }
  }, [categoriaEditar, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">
            {categoriaEditar ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Categoría</label>
            <input required type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full p-2.5 border rounded-lg" placeholder="Ej: Hamburguesas" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
            <textarea value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} className="w-full p-2.5 border rounded-lg" rows={3} placeholder="Breve descripción..."></textarea>
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