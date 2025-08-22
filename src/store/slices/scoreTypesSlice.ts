import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getScoreTypes, createScoreType as createScoreTypeApi, updateScoreType as updateScoreTypeApi, deleteScoreType as deleteScoreTypeApi } from '../../services/api';

interface ScoreType {
  id: string;
  name: string;
  description?: string;
  score_value: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ScoreTypesState {
  scoreTypes: ScoreType[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ScoreTypesState = {
  scoreTypes: [],
  isLoading: false,
  error: null,
};

export const fetchScoreTypes = createAsyncThunk(
  'scoreTypes/fetchScoreTypes',
  async (_, { rejectWithValue }) => {
    try {
      const scoreTypes = await getScoreTypes();
      return scoreTypes;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch score types');
    }
  }
);

export const createScoreType = createAsyncThunk(
  'scoreTypes/createScoreType',
  async (scoreTypeData: Partial<ScoreType>, { rejectWithValue }) => {
    try {
      const scoreType = await createScoreTypeApi(scoreTypeData);
      return scoreType;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create score type');
    }
  }
);

export const updateScoreType = createAsyncThunk(
  'scoreTypes/updateScoreType',
  async ({ id, ...scoreTypeData }: Partial<ScoreType> & { id: string }, { rejectWithValue }) => {
    try {
      const scoreType = await updateScoreTypeApi(id, scoreTypeData);
      return scoreType;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update score type');
    }
  }
);

export const deleteScoreType = createAsyncThunk(
  'scoreTypes/deleteScoreType',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteScoreTypeApi(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete score type');
    }
  }
);

const scoreTypesSlice = createSlice({
  name: 'scoreTypes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch score types
      .addCase(fetchScoreTypes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchScoreTypes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.scoreTypes = action.payload;
      })
      .addCase(fetchScoreTypes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create score type
      .addCase(createScoreType.fulfilled, (state, action) => {
        state.scoreTypes.push(action.payload);
      })
      // Update score type
      .addCase(updateScoreType.fulfilled, (state, action) => {
        const index = state.scoreTypes.findIndex(scoreType => scoreType.id === action.payload.id);
        if (index !== -1) {
          state.scoreTypes[index] = action.payload;
        }
      })
      // Delete score type
      .addCase(deleteScoreType.fulfilled, (state, action) => {
        state.scoreTypes = state.scoreTypes.filter(scoreType => scoreType.id !== action.payload);
      });
  },
});

export const { clearError } = scoreTypesSlice.actions;
export default scoreTypesSlice.reducer;