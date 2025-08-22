import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDashboardData } from '../../services/api';

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
  async (year: number, { rejectWithValue }) => {
    try {
      // For now, we'll use the same getDashboardData function
      // In a real implementation, you might want to create specific functions for these
      const data = await getDashboardData();
      // Transform the data to match MonthlyScore interface
      const monthlyScores: MonthlyScore[] = data.recentScores.map((score: any) => ({
        agent_name: score.agent?.first_name + ' ' + score.agent?.last_name || 'Unknown',
        month: new Date(score.score_date).getMonth() + 1,
        total_score: score.score_type?.score_value || 0
      }));
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
      // For now, we'll use the same getDashboardData function
      const data = await getDashboardData();
      // Transform the data to match ScoreTypeDistribution interface
      const distribution: ScoreTypeDistribution[] = data.recentScores.reduce((acc: any[], score: any) => {
        const scoreTypeName = score.score_type?.name || 'Unknown';
        const existing = acc.find(item => item.name === scoreTypeName);
        if (existing) {
          existing.count += 1;
          existing.total_value += score.score_type?.score_value || 0;
        } else {
          acc.push({
            name: scoreTypeName,
            count: 1,
            total_value: score.score_type?.score_value || 0
          });
        }
        return acc;
      }, []);
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
      // For now, we'll use the same getDashboardData function
      const data = await getDashboardData();
      // Transform the data to match AgentComparison interface
      const comparison: AgentComparison[] = data.recentScores.reduce((acc: any[], score: any) => {
        const agentName = score.agent?.first_name + ' ' + score.agent?.last_name || 'Unknown';
        const existing = acc.find(item => item.agent_name === agentName);
        if (existing) {
          existing.total_scores += 1;
          existing.total_points += score.score_type?.score_value || 0;
          existing.avg_score = existing.total_points / existing.total_scores;
          if (new Date(score.score_date) > new Date(existing.last_score_date)) {
            existing.last_score_date = score.score_date;
          }
        } else {
          acc.push({
            agent_name: agentName,
            total_scores: 1,
            total_points: score.score_type?.score_value || 0,
            avg_score: score.score_type?.score_value || 0,
            last_score_date: score.score_date
          });
        }
        return acc;
      }, []);
      return comparison;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch agent comparison');
    }
  }
);

export const fetchAgentEvolution = createAsyncThunk(
  'dashboard/fetchAgentEvolution',
  async ({ agentId, year }: { agentId: string; year: number }, { rejectWithValue }) => {
    try {
      // For now, we'll use the same getDashboardData function
      const data = await getDashboardData();
      // Transform the data to match AgentEvolution interface
      const evolution: AgentEvolution[] = data.recentScores
        .filter((score: any) => score.agent_id === parseInt(agentId))
        .reduce((acc: any[], score: any) => {
          const month = new Date(score.score_date).getMonth() + 1;
          const existing = acc.find(item => item.month === month);
          if (existing) {
            existing.total_score += score.score_type?.score_value || 0;
            existing.score_count += 1;
          } else {
            acc.push({
              month,
              total_score: score.score_type?.score_value || 0,
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