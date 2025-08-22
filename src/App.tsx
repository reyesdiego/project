import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Layout from './components/common/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AgentPointsDashboardPage from './pages/AgentPointsDashboardPage';
import AgentsPage from './pages/AgentsPage';
import ScoreTypesPage from './pages/ScoreTypesPage';
import AssignScoresPage from './pages/AssignScoresPage';
import ScoresPage from './pages/ScoresPage';
import UsersPage from './pages/UsersPage';
import UserSettingsPage from './pages/UserSettingsPage';
import './index.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="agent-points" element={<AgentPointsDashboardPage />} />
            <Route path="agents" element={<AgentsPage />} />
            <Route path="score-types" element={<ScoreTypesPage />} />
            <Route path="assign-scores" element={<AssignScoresPage />} />
            <Route path="scores" element={<ScoresPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="settings" element={<UserSettingsPage />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;