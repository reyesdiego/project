import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';
import { Trophy, Maximize2, Minimize2, Crown } from 'lucide-react';
import { AppDispatch, RootState } from '../store/store';
import { fetchAgentPointsHistory } from '../store/slices/agentPointsSlice';
import { AnimatePresence, motion } from "framer-motion";

const AgentPointsDashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { agentPoints, isLoading, error } = useSelector(
    (state: RootState) => state.agentPoints
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentComponent, setCurrentComponent] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = forward, -1 = backward (if you ever add manual controls)
  const [isTransitioning, setIsTransitioning] = useState(false);
  const fullscreenRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate colors for the bars
  const COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
    '#14B8A6', '#F43F5E', '#8B5CF6', '#06B6D4', '#84CC16'
  ];

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white">{`Agente: ${label}`}</p>
          <p className="text-blue-600 dark:text-blue-400">
            {`Puntos Totales: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const toggleFullscreen = () => {
    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);
    fullscreenRef.current = newFullscreenState;
    
    // Direct DOM manipulation to ensure fullscreen styles are applied immediately
    if (containerRef.current) {
      if (newFullscreenState) {
        containerRef.current.style.position = 'fixed';
        containerRef.current.style.top = '0';
        containerRef.current.style.left = '0';
        containerRef.current.style.right = '0';
        containerRef.current.style.bottom = '0';
        containerRef.current.style.zIndex = '50';
        containerRef.current.style.backgroundColor = 'white';
        containerRef.current.style.padding = '1.5rem';
        containerRef.current.style.overflow = 'auto';
        containerRef.current.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
        containerRef.current.classList.add('dark:bg-gray-900');
      } else {
        containerRef.current.style.position = '';
        containerRef.current.style.top = '';
        containerRef.current.style.left = '';
        containerRef.current.style.right = '';
        containerRef.current.style.bottom = '';
        containerRef.current.style.zIndex = '';
        containerRef.current.style.backgroundColor = '';
        containerRef.current.style.padding = '';
        containerRef.current.style.overflow = '';
        containerRef.current.style.boxShadow = '';
        containerRef.current.classList.remove('dark:bg-gray-900');
      }
    }
  };

  useEffect(() => {
    dispatch(fetchAgentPointsHistory());
  }, [dispatch, currentComponent]);


  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        fullscreenRef.current = false;
        
        // Reset DOM styles
        if (containerRef.current) {
          containerRef.current.style.position = '';
          containerRef.current.style.top = '';
          containerRef.current.style.left = '';
          containerRef.current.style.right = '';
          containerRef.current.style.bottom = '';
          containerRef.current.style.zIndex = '';
          containerRef.current.style.backgroundColor = '';
          containerRef.current.style.padding = '';
          containerRef.current.style.overflow = '';
          containerRef.current.style.boxShadow = '';
          containerRef.current.classList.remove('dark:bg-gray-900');
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isFullscreen]);

  // Keep ref in sync with state
  useLayoutEffect(() => {
    fullscreenRef.current = isFullscreen;
  }, [isFullscreen]);

   /* Agents Ranking Table */
   const AgentsRankingTable = () => (
   <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
     <div className="mb-6">
       <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
         🏆 Ranking de Agentes
       </h2>
       {/* <p className="text-gray-600 dark:text-gray-400">
         Clasificación completa de agentes ordenados por puntos totales
       </p> */}
     </div>

     <div className="space-y-2 w-full overflow-hidden">
       {agentPoints.map((agent, index) => {
         const maxPoints = agentPoints[0]?.total_points || 1;
         const percentage = (agent.total_points / maxPoints) * 100;
         
         // Calculate gradient color from green (winner) to red (loser)
         const hue = 120 - (index / (agentPoints.length - 1)) * 120; // 120 = green, 0 = red
         const saturation = 70;
         const lightness = 45;
         const backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
         const textColor = lightness > 50 ? '#1f2937' : '#ffffff';
         
         // Calculate width using percentage to stay within container
         const minPercentage = 20; // Minimum percentage for losers
         const calculatedWidth = Math.max(minPercentage, percentage);
         
                       return (
             <div
               key={agent.agent_id}
               className={`relative rounded-lg border transition-all duration-1000 ease-out hover:shadow-lg overflow-hidden ${
                 index === 0 ? 'ring-2 ring-yellow-400 ring-opacity-50 shadow-lg' : ''
               }`}
               style={{
                 backgroundColor,
                 color: textColor,
                 width: `${calculatedWidth}%`,
                 minHeight: '60px',
                 maxHeight: '76px'
               }}
             >
             {/* Position Badge with Trophy for top 3 */}
             <div className="absolute top-1 left-2 z-10">
               {index < 3 ? (
                 <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white bg-opacity-90 shadow-md">
                   {index === 0 ? (
                     <Crown className="w-4 h-4 text-yellow-500" />
                   ) : index === 1 ? (
                     <Trophy className="w-3 h-3 text-gray-400" />
                   ) : (
                     <Trophy className="w-2.5 h-2.5 text-orange-500" />
                   )}
                 </div>
               ) : (
                 <div className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold bg-white bg-opacity-90 text-gray-900 shadow-md">
                   {index + 1}
                 </div>
               )}
             </div>

             <div className="ml-12 p-2">
               {/* Agent Info */}
               <div className="flex items-center justify-between">
                 <div className="min-w-0 flex-1">
                   <h3 className="text-lg font-semibold truncate">
                     <b>{agent.agent_name}</b>
                   </h3>
                   <p className="text-xs opacity-90 truncate">
                     {agent.total_scores} evaluaciones
                   </p>
                 </div>
                 <div className="text-right flex-shrink-0 ml-4">
                   <div className="text-xl font-bold">
                     {agent.total_points.toLocaleString()}
                   </div>
                   <div className="text-xs opacity-90">
                   <b>{percentage > 0 
                       ? percentage.toFixed(1)
                       : '0.0'
                     } %</b>
                   </div>
                 </div>
               </div>

             </div>
           </div>
         );
       })}
     </div>
   </div>);

   /* Bar Chart */
   const AgentBarChart = () => (
   <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
     <div className="mb-6">
       <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
         Puntos Totales por Agente
       </h2>
       <p className="text-gray-600 dark:text-gray-400">
         Distribución completa de puntos acumulados por cada agente
       </p>
     </div>

     {agentPoints.length > 0 ? (
       <div className={isFullscreen ? "h-[calc(100vh-400px)]" : "h-96"}>
         <ResponsiveContainer width="90%" height="100%">
           <BarChart
             data={agentPoints}
             margin={{
               top: 20,
               right: 30,
               left: 20,
               bottom: 60,
             }}
           >
             <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
             <XAxis
               dataKey="agent_name"
               angle={-45}
               textAnchor="end"
               height={80}
               tick={{ fontSize: 12 }}
               stroke="#6B7280"
             />
             <YAxis
               tick={{ fontSize: 12 }}
               stroke="#6B7280"
               tickFormatter={(value) => value.toLocaleString()}
             />
             <Tooltip content={<CustomTooltip />} />
             <Legend />
             <Bar
               dataKey="total_points"
               name="Puntos Totales"
               radius={[4, 4, 0, 0]}
             >
               {agentPoints.map((_, index) => (
                 <Cell
                   key={`cell-${index}`}
                   fill={COLORS[index % COLORS.length]}
                 />
               ))}
             </Bar>
           </BarChart>
         </ResponsiveContainer>
       </div>
     ) : (
       <div className="text-center py-12">
         <div className="text-gray-500 dark:text-gray-400">
           No hay datos de puntos disponibles
         </div>
       </div>
     )}
   </div>);

   /* Agent List */
   const AgentList = () => (
   <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
     <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
       Lista de Agentes y Puntos
     </h2>
     <div className="overflow-x-auto">
       <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
         <thead className="bg-gray-50 dark:bg-gray-700">
           <tr>
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
               Posición
             </th>
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
               Agente
             </th>
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
               Puntos Totales
             </th>
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
               Evaluaciones
             </th>
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
               Promedio
             </th>
           </tr>
         </thead>
         <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
           {agentPoints.map((agent, index) => (
             <tr key={agent.agent_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
               <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                 {index + 1}
               </td>
               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                 {agent.agent_name}
               </td>
               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-semibold">
                 {agent.total_points.toLocaleString()}
               </td>
               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                 {agent.total_scores}
               </td>
               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                 {agent.total_scores > 0 
                   ? Math.round(agent.total_points / agent.total_scores).toLocaleString()
                   : '0'
                 }
               </td>
             </tr>
           ))}
         </tbody>
       </table>
     </div>
   </div>);

  const components = [
    AgentsRankingTable,
    AgentBarChart,
    AgentList
  ]
  const slides = [
    { key: "first",  node: <AgentsRankingTable /> },
    { key: "second", node: <AgentBarChart /> },
    { key: "third",  node: <AgentList /> },
  ];
  const variants = {
    initial: (dir: 1 | -1) => ({ opacity: 0, x: 40 * dir }),
    animate: { opacity: 1, x: 0, transition: { duration: 0.75, ease: "easeOut" } },
    exit:    (dir: 1 | -1) => ({ opacity: 0, x: -40 * dir, transition: { duration: 0.55, ease: "easeIn" } }),
  };

  useEffect(() => {
    const interval = setInterval(() => {
      // Only transition if not already transitioning
      if (!isTransitioning) {
        setDirection(1);
        setCurrentComponent((prev) => (prev + 1) % components.length);
      }
    }, 10000);

    // Cleanup function to clear the interval
    return () => clearInterval(interval);
  }, [components.length, isTransitioning]);


  // Calculate statistics
  // const topAgent = agentPoints.length > 0 ? agentPoints[0] : null;


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error al cargar los datos</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        {!isFullscreen && <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard de Puntos por Agente
            </h1>
            {isFullscreen && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                Pantalla Completa
              </span>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Vista completa del historial de puntos de todos los agentes
          </p>
        </div>}
        {!isFullscreen && <div className="mt-4 lg:mt-0">
          <button
            onClick={toggleFullscreen}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-4 w-4 mr-2" />
                Salir de Pantalla Completa
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4 mr-2" />
                Pantalla Completa
              </>
            )}
          </button>
        </div>}
      </div>
      <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={slides[currentComponent].key}
            custom={direction}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            onAnimationStart={() => setIsTransitioning(true)}
            onAnimationComplete={() => setIsTransitioning(false)}
          >
      {slides[currentComponent].node}
      </motion.div>
      </AnimatePresence>
    </div>
  );

  return (
    <div 
      ref={containerRef}
      className="space-y-6"
      data-fullscreen={isFullscreen}
    >
      {content}
    </div>
  );
};

export default AgentPointsDashboardPage;
