import React, { useEffect, useState } from 'react';
import {  useSelector } from 'react-redux';
import { Database, Play, RotateCcw, RefreshCw, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import {  RootState } from '../store/store';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface Migration {
  id: number;
  name: string;
  status: 'executed' | 'pending';
  executed_at?: string;
}

interface MigrationStatus {
  total: number;
  executed: number;
  pending: number;
  migrations: Migration[];
}

const MigrationsPage: React.FC = () => {

  const { user } = useSelector((state: RootState) => state.auth);
  
  const [status, setStatus] = useState<MigrationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunningMigrations, setIsRunningMigrations] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [environment, setEnvironment] = useState<'development' | 'production'>('development');

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/migrations/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        throw new Error('Failed to fetch migration status');
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const runMigrations = async () => {
    setIsRunningMigrations(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/migrations/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ environment })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        await fetchStatus(); // Refresh status
      } else {
        throw new Error(data.message || 'Failed to run migrations');
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsRunningMigrations(false);
    }
  };

  const rollbackMigration = async (migrationId: number) => {
    if (!confirm(`Are you sure you want to rollback migration ${migrationId}?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/migrations/rollback/${migrationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        await fetchStatus(); // Refresh status
      } else {
        throw new Error(data.message || 'Failed to rollback migration');
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Acceso Restringido
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Solo los administradores pueden gestionar las migraciones.
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Migraciones</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra las migraciones de la base de datos
          </p>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center space-x-3">
          <Button
            onClick={fetchStatus}
            variant="outline"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <Database className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{status.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ejecutadas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{status.executed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{status.pending}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Run Migrations Section */}
      {status && status.pending > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Ejecutar Migraciones Pendientes
          </h3>
          
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Ambiente:
              </label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as 'development' | 'production')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="development">Development</option>
                <option value="production">Production</option>
              </select>
            </div>
            
            <Button
              onClick={runMigrations}
              isLoading={isRunningMigrations}
              disabled={isRunningMigrations}
              className="sm:w-auto"
            >
              <Play className="w-4 h-4 mr-2" />
              Ejecutar Migraciones
            </Button>
          </div>
          
          {environment === 'production' && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Advertencia:</strong> Estás ejecutando migraciones en producción. 
                  Esto puede afectar los datos existentes.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Migrations List */}
      {status && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Lista de Migraciones
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fecha Ejecución
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {status.migrations.map((migration) => (
                  <tr key={migration.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {migration.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {migration.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        migration.status === 'executed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {migration.status === 'executed' ? 'Ejecutada' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {migration.executed_at 
                        ? new Date(migration.executed_at).toLocaleString()
                        : 'N/A'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {migration.status === 'executed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => rollbackMigration(migration.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MigrationsPage; 