import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'admin' | 'evaluador' | 'visualizador';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  first_name: string;
  last_name: string;
  area: string;
  position: string;
  hire_date: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScoreType {
  id: string;
  name: string;
  description?: string;
  score_value: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Score {
  id: string;
  agent_id: number;
  score_type_id: number;
  assigned_by?: number;
  score_date: string;
  comment?: string;
  created_at: string;
  updated_at: string;
} 