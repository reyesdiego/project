import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Phone, Save, AlertCircle } from 'lucide-react';
import { AppDispatch, RootState } from '../store/store';
import { updateUserPhone } from '../store/slices/authSlice';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const UserSettingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);

    try {
      await dispatch(updateUserPhone(phone));
      setMessage({ type: 'success', text: 'Teléfono actualizado correctamente' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al actualizar el teléfono' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner className="min-h-96" />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Usuario no encontrado
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configuración de Usuario</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gestiona tu información personal
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-xl">
              {user.first_name.charAt(0)}{user.last_name.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">@{user.username}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {user.role === 'admin' ? 'Admin' : 'Usuario'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Información Personal</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <p className="text-sm text-gray-900 dark:text-white">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Teléfono
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {user.phone || 'No especificado'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Actualizar Teléfono</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nuevo Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {message && (
                <div className={`p-3 rounded-lg flex items-center space-x-2 ${
                  message.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                    : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                }`}>
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{message.text}</span>
                </div>
              )}

              <Button
                type="submit"
                isLoading={isUpdating}
                disabled={isUpdating || phone === user.phone}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Actualizar Teléfono
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsPage; 