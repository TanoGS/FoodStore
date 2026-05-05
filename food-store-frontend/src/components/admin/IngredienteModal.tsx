import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { type Ingrediente } from '../../types/ingrediente.type';

interface IngredienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ingrediente: any) => void;
  ingredienteEditar?: Ingrediente | null;
}

export default function IngredienteModal({ isOpen, onClose, onSave, ingredienteEditar }: IngredienteModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    precio_adicional: 0,
    es_alergeno: false,
  });

  useEffect(() => {
    if (ingredienteEditar) {
      setFormData({
        nombre: ingredienteEditar.nombre,
        precio_adicional: ingredienteEditar.precio_adicional || 0,
        es_alergeno: ingredienteEditar.es_alergeno || false,
      });
    } else {
      setFormData({ nombre: '', precio_adicional: 0, es_alergeno: false });
    }
  }, [ingredienteEditar, isOpen]);

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
            {ingredienteEditar ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input required type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full p-2.5 border rounded-lg" placeholder="Ej: Queso Cheddar" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio Adicional ($)</label>
            <input required type="number" min="0" value={formData.precio_adicional} onChange={(e) => setFormData({...formData, precio_adicional: Number(e.target.value)})} className="w-full p-2.5 border rounded-lg" />
            <p className="text-xs text-gray-500 mt-1">Déjalo en 0 si no tiene costo extra.</p>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-xl hover:bg-gray-50 transition">
              <input type="checkbox" checked={formData.es_alergeno} onChange={(e) => setFormData({...formData, es_alergeno: e.target.checked})} className="w-5 h-5 text-red-600 rounded" />
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-5 w-5 ${formData.es_alergeno ? 'text-red-500' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${formData.es_alergeno ? 'text-red-700' : 'text-gray-700'}`}>
                  Marcar como Alérgeno (ej: TACC, Maní)
                </span>
              </div>
            </label>
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