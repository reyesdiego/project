import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';

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
      // Fetch all agents with their total points
      const { data: agents, error: agentsError } = await supabase
        .from('agents')
        .select('id, first_name, last_name, is_active')
        .eq('is_active', true)
        .order('first_name');

      if (agentsError) throw agentsError;

      // Fetch all scores for each agent
      const { data: scores, error: scoresError } = await supabase
        .from('scores')
        .select(`
          agent_id,
          score_type_id,
          score_date,
          score_types!inner(score_value)
        `)
        .order('score_date', { ascending: false });

      if (scoresError) throw scoresError;

      // Calculate points for each agent
      const agentPointsData: AgentPoints[] = agents.map(agent => {
        const agentScores = scores.filter(score => score.agent_id === agent.id);
        const totalPoints = agentScores.reduce((sum, score) => sum + (score.score_types?.score_value || 0), 0);
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
