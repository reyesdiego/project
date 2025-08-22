import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getScores, createScore as createScoreApi, updateScore as updateScoreApi, deleteScore as deleteScoreApi } from '../../services/api';
import { Score } from '../../lib/supabase';

interface ScoreWithNames extends Score {
  agent_name?: string;
  score_type_name?: string;
  score_value?: number;
  assigned_by_name?: string;
}

interface ScoresState {
  scores: ScoreWithNames[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: ScoresState = {
  scores: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
};

export const fetchScores = createAsyncThunk(
  'scores/fetchScores',
  async (filters: { agent_id?: string; month?: string; year?: string; page?: number } = {}, { rejectWithValue }) => {
    try {
      const scores = await getScores();
      // Transform the data to include the expected properties
      let transformedScores = scores.map((score: any) => ({
        ...score,
        agent_name: score.agent ? `${score.agent.first_name} ${score.agent.last_name}` : 'Unknown',
        score_type_name: score.score_type?.name || 'Unknown',
        score_value: score.score_type?.score_value || 0,
        assigned_by_name: score.assigned_by_user ? `${score.assigned_by_user.first_name} ${score.assigned_by_user.last_name}` : 'Unknown'
      }));

      // Apply filters
      if (filters.agent_id) {
        transformedScores = transformedScores.filter(score => score.agent_id === parseInt(filters.agent_id!));
      }
      if (filters.month) {
        transformedScores = transformedScores.filter(score => new Date(score.score_date).getMonth() + 1 === parseInt(filters.month!));
      }
      if (filters.year) {
        transformedScores = transformedScores.filter(score => new Date(score.score_date).getFullYear() === parseInt(filters.year!));
      }

      // Calculate pagination
      const limit = 10; // Items per page
      const page = filters.page || 1;
      const total = transformedScores.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedScores = transformedScores.slice(startIndex, endIndex);

      return {
        scores: paginatedScores,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch scores');
    }
  }
);

export const createScore = createAsyncThunk(
  'scores/createScore',
  async (scoreData: Partial<Score>, { rejectWithValue }) => {
    try {
      const score = await createScoreApi(scoreData);
      // Transform the returned score to include the expected properties
      const transformedScore = {
        ...score,
        agent_name: score.agent ? `${score.agent.first_name} ${score.agent.last_name}` : 'Unknown',
        score_type_name: score.score_type?.name || 'Unknown',
        score_value: score.score_type?.score_value || 0,
        assigned_by_name: score.assigned_by_user ? `${score.assigned_by_user.first_name} ${score.assigned_by_user.last_name}` : 'Unknown'
      };
      return transformedScore;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create score');
    }
  }
);

export const updateScore = createAsyncThunk(
  'scores/updateScore',
  async ({ id, ...scoreData }: Partial<Score> & { id: string }, { rejectWithValue }) => {
    try {
      const score = await updateScoreApi(id, scoreData);
      // Transform the returned score to include the expected properties
      const transformedScore = {
        ...score,
        agent_name: score.agent ? `${score.agent.first_name} ${score.agent.last_name}` : 'Unknown',
        score_type_name: score.score_type?.name || 'Unknown',
        score_value: score.score_type?.score_value || 0,
        assigned_by_name: score.assigned_by_user ? `${score.assigned_by_user.first_name} ${score.assigned_by_user.last_name}` : 'Unknown'
      };
      return transformedScore;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update score');
    }
  }
);

export const deleteScore = createAsyncThunk(
  'scores/deleteScore',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteScoreApi(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete score');
    }
  }
);

const scoresSlice = createSlice({
  name: 'scores',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch scores
      .addCase(fetchScores.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchScores.fulfilled, (state, action) => {
        state.isLoading = false;
        state.scores = action.payload.scores;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchScores.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create score
      .addCase(createScore.fulfilled, (state, action) => {
        state.scores.unshift(action.payload);
        state.pagination.total += 1;
        state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.limit);
      })
      // Update score
      .addCase(updateScore.fulfilled, (state, action) => {
        const index = state.scores.findIndex(score => score.id === action.payload.id);
        if (index !== -1) {
          state.scores[index] = action.payload;
        }
      })
      // Delete score
      .addCase(deleteScore.fulfilled, (state, action) => {
        state.scores = state.scores.filter(score => score.id !== action.payload);
        state.pagination.total -= 1;
        state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.limit);
      });
  },
});

export const { clearError } = scoresSlice.actions;
export default scoresSlice.reducer;