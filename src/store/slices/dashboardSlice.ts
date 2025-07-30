import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

interface DashboardStats {
  agents: number;
  scores: number;
  scoreTypes: number;
  users: number;
}

interface MonthlyScore {
  agent_name: string;
  month: number;
  total_score: number;
}

interface ScoreTypeDistribution {
  name: string;
  count: number;
  total_value: number;
}

interface AgentComparison {
  agent_name: string;
  total_scores: number;
  total_points: number;
  avg_score: number;
  last_score_date: string;
}

interface AgentEvolution {
  month: number;
  total_score: number;
  score_count: number;
}

interface DashboardState {
  stats: DashboardStats;
  monthlyScores: MonthlyScore[];
  scoreTypesDistribution: ScoreTypeDistribution[];
  agentComparison: AgentComparison[];
  agentEvolution: AgentEvolution[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: { agents: 0, scores: 0, scoreTypes: 0, users: 0 },
  monthlyScores: [],
  scoreTypesDistribution: [],
  agentComparison: [],
  agentEvolution: [],
  isLoading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchMonthlyScores = createAsyncThunk(
  'dashboard/fetchMonthlyScores',
  async (year: number, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/monthly-scores', { params: { year } });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch monthly scores');
    }
  }
);

export const fetchScoreTypesDistribution = createAsyncThunk(
  'dashboard/fetchScoreTypesDistribution',
  async (year: number, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/score-types-distribution', { params: { year } });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch score types distribution');
    }
  }
);

export const fetchAgentComparison = createAsyncThunk(
  'dashboard/fetchAgentComparison',
  async (year: number, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/agent-comparison', { params: { year } });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch agent comparison');
    }
  }
);

export const fetchAgentEvolution = createAsyncThunk(
  'dashboard/fetchAgentEvolution',
  async ({ agentId, year }: { agentId: string; year: number }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/dashboard/agent-evolution/${agentId}`, { params: { year } });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch agent evolution');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch monthly scores
      .addCase(fetchMonthlyScores.fulfilled, (state, action) => {
        state.monthlyScores = action.payload;
      })
      // Fetch score types distribution
      .addCase(fetchScoreTypesDistribution.fulfilled, (state, action) => {
        state.scoreTypesDistribution = action.payload;
      })
      // Fetch agent comparison
      .addCase(fetchAgentComparison.fulfilled, (state, action) => {
        state.agentComparison = action.payload;
      })
      // Fetch agent evolution
      .addCase(fetchAgentEvolution.fulfilled, (state, action) => {
        state.agentEvolution = action.payload;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;