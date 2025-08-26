import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAgents, getScores } from '../../services/api';

interface AgentPoints {
  agent_id: number;
  agent_name: string;
  total_points: number;
  total_scores: number;
  avg_score: number;
  last_score_date: string;
}

interface AgentPointsState {
  agentPoints: AgentPoints[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AgentPointsState = {
  agentPoints: [],
  isLoading: false,
  error: null,
};

export const fetchAgentPointsHistory = createAsyncThunk(
  'agentPoints/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch all agents and scores
      const [agents, scores] = await Promise.all([
        getAgents(),
        getScores()
      ]);

      // Filter active agents
      const activeAgents = agents.filter(agent => agent.is_active);

      // Calculate points for each agent
      const agentPointsData: AgentPoints[] = activeAgents.map(agent => {
        const agentScores = scores.filter(score => score.agent_id === agent.id);
        const totalPoints = agentScores.reduce((sum, score) => sum + (score.score_type?.score_value || 0), 0);
        const totalScores = agentScores.length;
        const avgScore = totalScores > 0 ? Math.round(totalPoints / totalScores) : 0;
        const lastScoreDate = agentScores.length > 0 ? agentScores[0].score_date : '';

        return {
          agent_id: agent.id,
          agent_name: `${agent.first_name} ${agent.last_name}`,
          total_points: totalPoints,
          total_scores: totalScores,
          avg_score: avgScore,
          last_score_date: lastScoreDate,
        };
      });

      // Sort by total points (descending)
      agentPointsData.sort((a, b) => b.total_points - a.total_points);

      return agentPointsData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch agent points history');
    }
  }
);

const agentPointsSlice = createSlice({
  name: 'agentPoints',
  initialState,
  reducers: {
    clearAgentPoints: (state) => {
      state.agentPoints = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgentPointsHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAgentPointsHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.agentPoints = action.payload;
        state.error = null;
      })
      .addCase(fetchAgentPointsHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAgentPoints } = agentPointsSlice.actions;
export default agentPointsSlice.reducer;
