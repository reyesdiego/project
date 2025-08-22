import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  UserCheck, 
  Trophy, 
  ClipboardList, 
  Settings, 
  Menu,
  X,
  Home,
  TrendingUp
} from 'lucide-react';
import { RootState } from '../../store/store';
import clsx from 'clsx';

const Sidebar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, allowedRoles: ['admin', 'evaluador', 'visualizador'] },
    { name: 'Puntos por Agente', href: '/agent-points', icon: TrendingUp, allowedRoles: ['admin', 'evaluador', 'visualizador'] },
    { name: 'Agentes', href: '/agents', icon: UserCheck, allowedRoles: ['admin', 'evaluador'] },
    { name: 'Tipos de Puntaje', href: '/score-types', icon: Trophy, allowedRoles: ['admin'] },
    { name: 'Asignar Puntajes', href: '/assign-scores', icon: ClipboardList, allowedRoles: ['admin', 'evaluador'] },
    { name: 'Listado de Puntajes', href: '/scores', icon: BarChart3, allowedRoles: ['admin', 'evaluador', 'visualizador'] },
    { name: 'Usuarios', href: '/users', icon: Users, allowedRoles: ['admin'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    user && item.allowedRoles.includes(user.role)
  );

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          ) : (
            <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out',
          {
            'translate-x-0': isMobileMenuOpen,
            '-translate-x-full lg:translate-x-0': !isMobileMenuOpen,
          }
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">ScoreTeam</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={clsx(
                    'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                    {
                      'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800': isActive,
                      'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white': !isActive,
                    }
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;