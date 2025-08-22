import { supabase, User, Agent, ScoreType, Score } from '../lib/supabase';

// Auth functions
export const login = async (username: string, password: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    throw new Error('Invalid credentials');
  }

  // For now, we'll use a simple password check
  // In production, you should use Supabase Auth or implement proper password hashing
  if (password !== 'admin123') {
    throw new Error('Invalid credentials');
  }

  // Store user data in localStorage (in production, use Supabase Auth)
  localStorage.setItem('user', JSON.stringify(data));
  localStorage.setItem('token', 'dummy-token'); // In production, use real JWT

  return { user: data, token: 'dummy-token' };
};

export const logout = async () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  await supabase.auth.signOut();
};

export const getCurrentUser = async (): Promise<User | null> => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const updateUserPhone = async (phone: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('users')
    .update({ phone, updated_at: new Date().toISOString() })
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;

  // Update local storage
  localStorage.setItem('user', JSON.stringify(data));
  
  return data;
};

// User management (admin only)
export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createUser = async (userData: Partial<User> & { password: string }) => {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateUser = async (id: string, userData: Partial<User>) => {
  const { data, error } = await supabase
    .from('users')
    .update({ ...userData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteUser = async (id: string) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Agent management
export const getAgents = async (): Promise<Agent[]> => {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .order('first_name', { ascending: true });

  if (error) throw error;
  return data;
};

export const getAgent = async (id: string): Promise<Agent> => {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createAgent = async (agentData: Partial<Agent>) => {
  const { data, error } = await supabase
    .from('agents')
    .insert([agentData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateAgent = async (id: string, agentData: Partial<Agent>) => {
  const { data, error } = await supabase
    .from('agents')
    .update({ ...agentData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteAgent = async (id: string) => {
  const { error } = await supabase
    .from('agents')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Score types management
export const getScoreTypes = async (): Promise<ScoreType[]> => {
  const { data, error } = await supabase
    .from('score_types')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
};

export const createScoreType = async (scoreTypeData: Partial<ScoreType>) => {
  const { data, error } = await supabase
    .from('score_types')
    .insert([scoreTypeData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateScoreType = async (id: string, scoreTypeData: Partial<ScoreType>) => {
  const { data, error } = await supabase
    .from('score_types')
    .update({ ...scoreTypeData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteScoreType = async (id: string) => {
  const { error } = await supabase
    .from('score_types')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Scores management
export const getScores = async (): Promise<Score[]> => {
  const { data, error } = await supabase
    .from('scores')
    .select(`
      *,
      agent:agents(first_name, last_name),
      score_type:score_types(name, score_value),
      assigned_by_user:users(first_name, last_name)
    `)
    .order('score_date', { ascending: false });

  if (error) throw error;
  return data;
};

export const createScore = async (scoreData: Partial<Score>) => {
  const { data, error } = await supabase
    .from('scores')
    .insert([scoreData])
    .select(`
      *,
      agent:agents(first_name, last_name),
      score_type:score_types(name, score_value),
      assigned_by_user:users(first_name, last_name)
    `)
    .single();

  if (error) throw error;
  return data;
};

export const updateScore = async (id: string, scoreData: Partial<Score>) => {
  const { data, error } = await supabase
    .from('scores')
    .update({ ...scoreData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(`
      *,
      agent:agents(first_name, last_name),
      score_type:score_types(name, score_value),
      assigned_by_user:users(first_name, last_name)
    `)
    .single();

  if (error) throw error;
  return data;
};

export const deleteScore = async (id: string) => {
  const { error } = await supabase
    .from('scores')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Dashboard data
export const getDashboardData = async () => {
  const [agentsResult, scoresResult, scoreTypesResult, usersResult] = await Promise.all([
    supabase.from('agents').select('*').eq('is_active', true),
    supabase.from('scores').select(`
      *,
      agent:agents(first_name, last_name),
      score_type:score_types(name, score_value),
      assigned_by_user:users(first_name, last_name)
    `).order('score_date', { ascending: false }),
    supabase.from('score_types').select('*').eq('is_active', true),
    supabase.from('users').select('*').eq('is_active', true)
  ]);

  console.log(
    agentsResult,
    scoresResult,
    scoreTypesResult,
    usersResult
  )

  if (agentsResult.error) throw agentsResult.error;
  if (scoresResult.error) throw scoresResult.error;
  if (scoreTypesResult.error) throw scoreTypesResult.error;
  if (usersResult.error) throw usersResult.error;

  return {
    totalAgents: agentsResult.data.length,
    totalScores: scoresResult.data.length,
    totalScoreTypes: scoreTypesResult.data.length,
    totalUsers: usersResult.data.length,
    recentScores: scoresResult.data.slice(0, 5)
  };
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
  getDashboardData
};

export default api;