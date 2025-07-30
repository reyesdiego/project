import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { Users, Trophy, ClipboardList, UserCheck, TrendingUp, Calendar } from 'lucide-react';
import { AppDispatch, RootState } from '../store/store';
import {
  fetchDashboardStats,
  fetchMonthlyScores,
  fetchScoreTypesDistribution,
  fetchAgentComparison,
} from '../store/slices/dashboardSlice';

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, monthlyScores, scoreTypesDistribution, agentComparison, isLoading } = useSelector(
      (state: RootState) => state.dashboard
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchMonthlyScores(selectedYear));
    dispatch(fetchScoreTypesDistribution(selectedYear));
    dispatch(fetchAgentComparison(selectedYear));
  }, [dispatch, selectedYear]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const monthNames = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  // Process monthly scores for chart
  const monthlyChartData = monthNames.map((month, index) => {
    const monthData: any = { month };
    const monthScores = monthlyScores.filter(score => score.month == index + 1);
    monthScores.forEach(score => {
      monthData[score.agent_name] = Number(score.total_score) || 0;
    });

    return monthData;
  });
  // Get unique agents for the chart
  const uniqueAgents = [...new Set(monthlyScores.map(score => score.agent_name))].filter(Boolean);

  const statCards = [
    {
      title: 'Total Agentes',
      value: stats.agents,
      icon: UserCheck,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'Puntajes Asignados',
      value: stats.scores,
      icon: ClipboardList,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      title: 'Tipos de Puntaje',
      value: stats.scoreTypes,
      icon: Trophy,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Usuarios Activos',
      value: stats.users,
      icon: Users,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
    },
  ];

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Vista general del sistema de evaluación
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
              <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {card.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {card.value}
                    </p>
                  </div>
                  <div className={`${card.color} p-3 rounded-full`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Scores Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Puntajes Mensuales por Agente
              </h3>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                {uniqueAgents.slice(0, 4).map((agent, index) => (
                    <Bar
                        key={agent}
                        dataKey={agent}
                        fill={COLORS[index % COLORS.length]}
                        radius={[4, 4, 0, 0]}
                    />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Score Types Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Distribución de Tipos de Puntaje
              </h3>
              <Trophy className="w-5 h-5 text-green-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                    data={scoreTypesDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                >
                  {scoreTypesDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agent Comparison Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Comparativa de Agentes
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Rendimiento de agentes en el año {selectedYear}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Agente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Puntajes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Puntos Totales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Promedio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Último Puntaje
                </th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {agentComparison.map((agent, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {agent.agent_name.split(' ').map(n => n[0]).join('')}
                        </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {agent.agent_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {agent.total_scores || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        (agent.total_points || 0) >= 0
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {agent.total_points || 0}
                    </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {agent.avg_score ? Number(agent.avg_score).toFixed(1) : '0.0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {agent.last_score_date ? new Date(agent.last_score_date).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
};

export default DashboardPage;