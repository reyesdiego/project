import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {ClipboardList, Calendar, MessageSquare, Trophy, UserCheck, Users} from 'lucide-react';
import { AppDispatch, RootState } from '../store/store';
import { fetchAgents } from '../store/slices/agentsSlice';
import { fetchScoreTypes } from '../store/slices/scoreTypesSlice';
import { createScore } from '../store/slices/scoresSlice';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AssignScoresPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { agents, isLoading: agentsLoading } = useSelector((state: RootState) => state.agents);
  const { scoreTypes, isLoading: scoreTypesLoading } = useSelector((state: RootState) => state.scoreTypes);
  const { user } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    agent_id: '',
    score_type_id: '',
    score_date: new Date().toISOString().split('T')[0],
    comment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    dispatch(fetchAgents());
    dispatch(fetchScoreTypes());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      await dispatch(createScore({
        ...formData,
        agent_id: parseInt(formData.agent_id),
        score_type_id: parseInt(formData.score_type_id),
        assigned_by: user?.id ? parseInt(user.id) : undefined
      }));
      setSuccessMessage('Puntaje asignado exitosamente');
      setFormData({
        agent_id: '',
        score_type_id: '',
        score_date: new Date().toISOString().split('T')[0],
        comment: '',
      });
    } catch (error) {
      console.error('Error assigning score:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedScoreType = scoreTypes.find(st => st.id === formData.score_type_id);
  const selectedAgent = agents.find(a => a.id === formData.agent_id);

  if (user?.role !== 'admin' && user?.role !== 'evaluador') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Acceso Restringido
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Solo los administradores y evaluadores pueden asignar puntajes.
          </p>
        </div>
      </div>
    );
  }

  if (agentsLoading || scoreTypesLoading) {
    return <LoadingSpinner className="min-h-96" />;
  }

  if (currentUser?.role !== 'admin' && currentUser?.role !== 'evaluador') {
    return (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Acceso Restringido
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Solo los administradores pueden gestionar usuarios.
            </p>
          </div>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ClipboardList className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Asignar Puntajes</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Evalúa el desempeño de los agentes asignando puntajes
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-600 dark:text-green-400 text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {/* Assignment Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Formulario de Asignación
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Completa todos los campos para asignar un puntaje
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agent Selection */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <UserCheck className="w-4 h-4 mr-2" />
                Seleccionar Agente
              </label>
              <select
                name="agent_id"
                value={formData.agent_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona un agente</option>
                {agents.filter(agent => agent.is_active).map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.first_name} {agent.last_name} - {agent.area}
                  </option>
                ))}
              </select>
            </div>

            {/* Score Type Selection */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <Trophy className="w-4 h-4 mr-2" />
                Tipo de Puntaje
              </label>
              <select
                name="score_type_id"
                value={formData.score_type_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona un tipo de puntaje</option>
                {scoreTypes.filter(scoreType => scoreType.is_active).map((scoreType) => (
                  <option key={scoreType.id} value={scoreType.id}>
                    {scoreType.name} ({scoreType.score_value > 0 ? '+' : ''}{scoreType.score_value} puntos)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <Calendar className="w-4 h-4 mr-2" />
              Fecha del Puntaje
            </label>
            <input
              type="date"
              name="score_date"
              value={formData.score_date}
              onChange={handleChange}
              required
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <MessageSquare className="w-4 h-4 mr-2" />
              Comentario (opcional)
            </label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Agrega observaciones o detalles sobre esta evaluación..."
            />
          </div>

          {/* Preview Card */}
          {selectedAgent && selectedScoreType && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Vista Previa de la Asignación
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Agente:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedAgent.first_name} {selectedAgent.last_name}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    {selectedAgent.area} - {selectedAgent.position}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Evaluación:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedScoreType.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {selectedScoreType.description}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Puntaje:</p>
                  <div className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${
                    selectedScoreType.score_value >= 0
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {selectedScoreType.score_value > 0 ? '+' : ''}{selectedScoreType.score_value} puntos
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              isLoading={isSubmitting}
              disabled={!formData.agent_id || !formData.score_type_id || !formData.score_date}
            >
              Asignar Puntaje
            </Button>
          </div>
        </form>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Agentes Activos</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {agents.filter(a => a.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tipos de Puntaje</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {scoreTypes.filter(st => st.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Fecha Actual</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignScoresPage;