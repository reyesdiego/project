import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Edit, Trash2, Users, Shield, Eye } from 'lucide-react';
import { AppDispatch, RootState } from '../store/store';
import { fetchUsers, createUser, updateUser, deleteUser } from '../store/slices/usersSlice';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
}

const UsersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, isLoading } = useSelector((state: RootState) => state.users);
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<{
    username: string;
    email: string;
    password?: string;
    first_name: string;
    last_name: string;
    phone: string;
    is_admin: boolean;
    is_active: boolean;
  }>({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    is_admin: false,
    is_active: true,
  });

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const filteredUsers = users.filter(user =>
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.is_admin ? 'admin' : 'usuario').includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone || '',
        is_admin: user.is_admin,
        is_active: user.is_active,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        is_admin: false,
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password; // Don't update password if not provided
        }
        await dispatch(updateUser({ id: editingUser.id, ...updateData }));
      } else {
        // Ensure password is provided for new users
        if (!formData.password) {
          return; // Don't create user without password
        }
        await dispatch(createUser(formData as Partial<User> & { password: string }));
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingUser) {
      await dispatch(deleteUser(deletingUser.id));
      setDeletingUser(null);
    }
  };

  const getRoleIcon = (isAdmin: boolean) => {
    if (isAdmin) {
      return <Shield className="w-4 h-4 text-red-600" />;
    } else {
      return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (isAdmin: boolean) => {
    if (isAdmin) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    } else {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    }
  };

  if (!currentUser?.is_admin) {
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

  if (isLoading) {
    return <LoadingSpinner className="min-h-96" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra los usuarios del sistema
          </p>
        </div>
        <div className="mt-4 lg:mt-0">
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-red-600" />
            <span>Admin: {users.filter(u => u.is_admin).length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Usuarios: {users.filter(u => !u.is_admin).length}</span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fecha Creación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {user.phone || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.is_admin)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.is_admin)}`}>
                        {user.is_admin ? 'Admin' : 'Usuario'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {user.id !== currentUser?.id && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeletingUser(user)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Apellido
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre de Usuario
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="+1234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {editingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password || ''}
                onChange={handleChange}
                required={!editingUser}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rol
              </label>
              <select
                name="is_admin"
                value={formData.is_admin.toString()}
                onChange={(e) => setFormData(prev => ({ ...prev, is_admin: e.target.value === 'true' }))}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="false">Usuario</option>
                <option value="true">Administrador</option>
              </select>
            </div>
          </div>

          {editingUser && (
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Usuario activo
              </label>
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Permisos por Rol:
            </h4>
            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Shield className="w-3 h-3 text-red-600" />
                <span><strong>Administrador:</strong> Acceso completo al sistema</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-3 h-3 text-blue-600" />
                <span><strong>Usuario:</strong> Acceso básico al sistema</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingUser ? 'Actualizar' : 'Crear'} Usuario
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que quieres eliminar al usuario ${deletingUser?.first_name} ${deletingUser?.last_name}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        type="danger"
      />
    </div>
  );
};

export default UsersPage;