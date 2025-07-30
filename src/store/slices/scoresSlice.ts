import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

interface Score {
  id: string;
  agent_id: string;
  score_type_id: string;
  assigned_by: string;
  score_date: string;
  comment?: string;
  created_at: string;
  updated_at: string;
  agent_name?: string;
  score_type_name?: string;
  score_value?: number;
  assigned_by_name?: string;
}

interface ScoresState {
  scores: Score[];
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

interface FetchScoresParams {
  agent_id?: string;
  month?: number;
  year?: number;
  page?: number;
  limit?: number;
}

export const fetchScores = createAsyncThunk(
  'scores/fetchScores',
  async (params: FetchScoresParams, { rejectWithValue }) => {
    try {
      const response = await api.get('/scores', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch scores');
    }
  }
);

export const createScore = createAsyncThunk(
  'scores/createScore',
  async (scoreData: Partial<Score>, { rejectWithValue }) => {
    try {
      const response = await api.post('/scores', scoreData);
      return response.data.score;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create score');
    }
  }
);

export const updateScore = createAsyncThunk(
  'scores/updateScore',
  async ({ id, ...scoreData }: Partial<Score> & { id: string }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/scores/${id}`, scoreData);
      return response.data.score;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update score');
    }
  }
);

export const deleteScore = createAsyncThunk(
  'scores/deleteScore',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/scores/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete score');
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
      });
  },
});

export const { clearError } = scoresSlice.actions;
export default scoresSlice.reducer;