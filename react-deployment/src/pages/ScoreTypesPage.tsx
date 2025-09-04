import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Edit, Trash2, Trophy } from 'lucide-react';
import { AppDispatch, RootState } from '../store/store';
import { fetchScoreTypes, createScoreType, updateScoreType, deleteScoreType } from '../store/slices/scoreTypesSlice';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface ScoreType {
  id: string;
  name: string;
  description: string;
  score_value: number;
  is_active: boolean;
}

const ScoreTypesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { scoreTypes, isLoading } = useSelector((state: RootState) => state.scoreTypes);
  const { user } = useSelector((state: RootState) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScoreType, setEditingScoreType] = useState<ScoreType | null>(null);
  const [deletingScoreType, setDeletingScoreType] = useState<ScoreType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    score_value: 0,
    is_active: true,
  });

  useEffect(() => {
    dispatch(fetchScoreTypes());
  }, [dispatch]);

  const filteredScoreTypes = scoreTypes.filter(scoreType =>
    scoreType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scoreType.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (scoreType?: ScoreType) => {
    if (scoreType) {
      setEditingScoreType(scoreType);
      setFormData({
        name: scoreType.name,
        description: scoreType.description,
        score_value: scoreType.score_value,
        is_active: scoreType.is_active,
      });
    } else {
      setEditingScoreType(null);
      setFormData({
        name: '',
        description: '',
        score_value: 0,
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingScoreType(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'score_value' && type === 'number') {
      const numValue = Number(value);
      // Round to nearest 0.05 (multiple of 5 cents)
      const roundedValue = Math.round(numValue * 20) / 20;
      setFormData(prev => ({
        ...prev,
        [name]: roundedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : 
                type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingScoreType) {
        await dispatch(updateScoreType({ id: editingScoreType.id, ...formData }));
      } else {
        await dispatch(createScoreType(formData));
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving score type:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingScoreType) {
      await dispatch(deleteScoreType(deletingScoreType.id));
      setDeletingScoreType(null);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Acceso Restringido
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Solo los administradores pueden gestionar los tipos de puntaje.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner className="min-h-96" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Puntajes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configura los diferentes tipos de evaluación
          </p>
        </div>
        <div className="mt-4 lg:mt-0">
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Puntaje
          </Button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar tipos de puntaje..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4" />
            <span>Total: {scoreTypes.length} tipos</span>
          </div>
        </div>
      </div>

      {/* Score Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScoreTypes.map((scoreType) => (
          <div
            key={scoreType.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  scoreType.score_value >= 0 
                    ? 'bg-green-100 dark:bg-green-900/20' 
                    : 'bg-red-100 dark:bg-red-900/20'
                }`}>
                  <Trophy className={`w-6 h-6 ${
                    scoreType.score_value >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {scoreType.name}
                  </h3>
                  <div className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                    scoreType.score_value >= 0
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {scoreType.score_value > 0 ? '+' : ''}{scoreType.score_value} puntos
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenModal(scoreType)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeletingScoreType(scoreType)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {scoreType.description}
            </p>

            <div className="flex items-center justify-between">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                scoreType.is_active
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
              }`}>
                {scoreType.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Score Type Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingScoreType ? 'Editar Tipo de Puntaje' : 'Nuevo Tipo de Puntaje'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Puntualidad, Calidad de trabajo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Describe qué evalúa este tipo de puntaje"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valor del Puntaje
            </label>
            <input
              type="number"
              name="score_value"
              value={formData.score_value}
              onChange={handleChange}
              step="0.05"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: 5.00, 2.50, -1.25"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Ingresa un valor positivo para premios o negativo for penalizaciones
            </p>
          </div>

          {editingScoreType && (
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo de puntaje activo
              </label>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingScoreType ? 'Actualizar' : 'Crear'} Tipo de Puntaje
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingScoreType}
        onClose={() => setDeletingScoreType(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Tipo de Puntaje"
        message={`¿Estás seguro de que quieres eliminar el tipo de puntaje "${deletingScoreType?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        type="danger"
      />
    </div>
  );
};

export default ScoreTypesPage;