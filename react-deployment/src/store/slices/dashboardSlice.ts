import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDashboardData, getMonthlyScores, getScoreTypesDistribution, getAgentComparison } from '../../services/api';

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
      const data = await getDashboardData();
      // Transform the data to match DashboardStats interface
      const stats = {
        agents: data.totalAgents,
        scores: data.totalScores,
        scoreTypes: data.totalScoreTypes,
        users: data.totalUsers
      };
      return stats;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchMonthlyScores = createAsyncThunk(
  'dashboard/fetchMonthlyScores',
  async ({ year, month }: { year: number; month?: number }, { rejectWithValue }) => {
    try {
      const monthlyScores = await getMonthlyScores(year, month);
      return monthlyScores;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch monthly scores');
    }
  }
);

export const fetchScoreTypesDistribution = createAsyncThunk(
  'dashboard/fetchScoreTypesDistribution',
  async (year: number, { rejectWithValue }) => {
    try {
      const distribution = await getScoreTypesDistribution(year);
      return distribution;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch score types distribution');
    }
  }
);

export const fetchAgentComparison = createAsyncThunk(
  'dashboard/fetchAgentComparison',
  async (year: number, { rejectWithValue }) => {
    try {
      const comparison = await getAgentComparison(year);
      return comparison;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch agent comparison');
    }
  }
);

export const fetchAgentEvolution = createAsyncThunk(
  'dashboard/fetchAgentEvolution',
  async ({ agentId, year }: { agentId: number; year: number }, { rejectWithValue }) => {
    try {
      // For now, we'll use the same getDashboardData function
      const data = await getDashboardData();
      // Transform the data to match AgentEvolution interface
      const evolution: AgentEvolution[] = data.recentScores
        .filter((score: any) => score.agent_id === agentId)
        .reduce((acc: any[], score: any) => {
          const month = new Date(score.score_date).getMonth() + 1;
          const existing = acc.find(item => item.month === month);
          if (existing) {
            existing.total_score += Number(score.score_type?.score_value || 0);
            existing.score_count += 1;
          } else {
            acc.push({
              month,
              total_score: Number(score.score_type?.score_value || 0),
              score_count: 1
            });
          }
          return acc;
        }, []);
      return evolution;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch agent evolution');
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
      // Fetch dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
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
      .addCase(fetchMonthlyScores.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMonthlyScores.fulfilled, (state, action) => {
        state.isLoading = false;
        state.monthlyScores = action.payload;
      })
      .addCase(fetchMonthlyScores.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch score types distribution
      .addCase(fetchScoreTypesDistribution.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchScoreTypesDistribution.fulfilled, (state, action) => {
        state.isLoading = false;
        state.scoreTypesDistribution = action.payload;
      })
      .addCase(fetchScoreTypesDistribution.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch agent comparison
      .addCase(fetchAgentComparison.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAgentComparison.fulfilled, (state, action) => {
        state.isLoading = false;
        state.agentComparison = action.payload;
      })
      .addCase(fetchAgentComparison.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch agent evolution
      .addCase(fetchAgentEvolution.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAgentEvolution.fulfilled, (state, action) => {
        state.isLoading = false;
        state.agentEvolution = action.payload;
      })
      .addCase(fetchAgentEvolution.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;