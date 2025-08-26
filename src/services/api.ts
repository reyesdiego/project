// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScoreType {
  id: number;
  name: string;
  description?: string;
  score_value: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Score {
  id: number;
  agent_id: number;
  score_type_id: number;
  assigned_by: number;
  score_date: string;
  comment?: string;
  created_at: string;
  updated_at: string;
  agent?: {
    first_name: string;
    last_name: string;
  };
  score_type?: {
    name: string;
    score_value: number;
  };
  assigned_by_user?: {
    first_name: string;
    last_name: string;
  };
}

export interface DashboardStats {
  totalAgents: number;
  totalScores: number;
  totalScoreTypes: number;
  totalUsers: number;
  recentScores: Score[];
}

export interface MonthlyScore {
  agent_name: string;
  month: number;
  total_score: number;
}

export interface ScoreTypeDistribution {
  name: string;
  count: number;
  total_value: number;
}

export interface AgentComparison {
  agent_name: string;
  total_scores: number;
  total_points: number;
  avg_score: number;
  last_score_date: string;
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Auth functions
export const login = async (username: string, password: string) => {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  // Store token and user data
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));

  return data;
};

export const logout = async () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const data = await apiRequest('/auth/me');
    return data.user;
  } catch {
    return null;
  }
};

export const updateUserPhone = async (phone: string) => {
  const data = await apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify({ phone }),
  });

  // Update local storage
  localStorage.setItem('user', JSON.stringify(data.user));
  
  return data.user;
};

// User management (admin only)
export const getUsers = async (): Promise<User[]> => {
  const data = await apiRequest('/users');
  return data.users;
};

export const createUser = async (userData: Partial<User> & { password: string }) => {
  const data = await apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  return data.user;
};

export const updateUser = async (id: number, userData: Partial<User>) => {
  const data = await apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
  return data.user;
};

export const deleteUser = async (id: number) => {
  await apiRequest(`/users/${id}`, {
    method: 'DELETE',
  });
};

// Agent management
export const getAgents = async (): Promise<Agent[]> => {
  const data = await apiRequest('/agents');
  return data.agents;
};

export const getAgent = async (id: number): Promise<Agent> => {
  const data = await apiRequest(`/agents/${id}`);
  return data.agent;
};

export const createAgent = async (agentData: Partial<Agent>) => {
  const data = await apiRequest('/agents', {
    method: 'POST',
    body: JSON.stringify(agentData),
  });
  return data.agent;
};

export const updateAgent = async (id: number, agentData: Partial<Agent>) => {
  const data = await apiRequest(`/agents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(agentData),
  });
  return data.agent;
};

export const deleteAgent = async (id: number) => {
  await apiRequest(`/agents/${id}`, {
    method: 'DELETE',
  });
};

// Score types management
export const getScoreTypes = async (): Promise<ScoreType[]> => {
  const data = await apiRequest('/score-types');
  return data.scoreTypes;
};

export const createScoreType = async (scoreTypeData: Partial<ScoreType>) => {
  const data = await apiRequest('/score-types', {
    method: 'POST',
    body: JSON.stringify(scoreTypeData),
  });
  return data.scoreType;
};

export const updateScoreType = async (id: number, scoreTypeData: Partial<ScoreType>) => {
  const data = await apiRequest(`/score-types/${id}`, {
    method: 'PUT',
    body: JSON.stringify(scoreTypeData),
  });
  return data.scoreType;
};

export const deleteScoreType = async (id: number) => {
  await apiRequest(`/score-types/${id}`, {
    method: 'DELETE',
  });
};

// Scores management
export const getScores = async (): Promise<Score[]> => {
  const data = await apiRequest('/scores');
  return data.scores;
};

export const createScore = async (scoreData: Partial<Score>) => {
  const data = await apiRequest('/scores', {
    method: 'POST',
    body: JSON.stringify(scoreData),
  });
  return data.score;
};

export const updateScore = async (id: number, scoreData: Partial<Score>) => {
  const data = await apiRequest(`/scores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(scoreData),
  });
  return data.score;
};

export const deleteScore = async (id: number) => {
  await apiRequest(`/scores/${id}`, {
    method: 'DELETE',
  });
};

// Dashboard data
export const getDashboardData = async (): Promise<DashboardStats> => {
  const data = await apiRequest('/dashboard/stats');
  return data;
};

// Get monthly scores aggregated by agent and month
export const getMonthlyScores = async (year: number, month?: number): Promise<MonthlyScore[]> => {
  const params = new URLSearchParams({ year: year.toString() });
  if (month !== undefined && month !== null) {
    params.append('month', month.toString());
  }
  
  const data = await apiRequest(`/dashboard/monthly-scores?${params}`);
  return data;
};

// Get score types distribution
export const getScoreTypesDistribution = async (year: number): Promise<ScoreTypeDistribution[]> => {
  const params = new URLSearchParams({ year: year.toString() });
  const data = await apiRequest(`/dashboard/score-types-distribution?${params}`);
  return data;
};

// Get agent comparison
export const getAgentComparison = async (year: number): Promise<AgentComparison[]> => {
  const params = new URLSearchParams({ year: year.toString() });
  const data = await apiRequest(`/dashboard/agent-comparison?${params}`);
  return data;
};

// Default export for backward compatibility
const api = {
  login,
  logout,
  getCurrentUser,
  updateUserPhone,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getAgents,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent,
  getScoreTypes,
  createScoreType,
  updateScoreType,
  deleteScoreType,
  getScores,
  createScore,
  updateScore,
  deleteScore,
  getDashboardData,
  getMonthlyScores,
  getScoreTypesDistribution,
  getAgentComparison
};

export default api;