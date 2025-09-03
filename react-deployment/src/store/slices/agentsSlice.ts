import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAgents, createAgent as createAgentApi, updateAgent as updateAgentApi, deleteAgent as deleteAgentApi } from '../../services/api';

interface Agent {
  id: number;
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

interface AgentsState {
  agents: Agent[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AgentsState = {
  agents: [],
  isLoading: false,
  error: null,
};

export const fetchAgents = createAsyncThunk(
  'agents/fetchAgents',
  async (_, { rejectWithValue }) => {
    try {
      const agents = await getAgents();
      return agents;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch agents');
    }
  }
);

export const createAgent = createAsyncThunk(
  'agents/createAgent',
  async (agentData: Partial<Agent>, { rejectWithValue }) => {
    try {
      const agent = await createAgentApi(agentData);
      return agent;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create agent');
    }
  }
);

export const updateAgent = createAsyncThunk(
  'agents/updateAgent',
  async ({ id, ...agentData }: Partial<Agent> & { id: number }, { rejectWithValue }) => {
    try {
      const agent = await updateAgentApi(id, agentData);
      return agent;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update agent');
    }
  }
);

export const deleteAgent = createAsyncThunk(
  'agents/deleteAgent',
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteAgentApi(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete agent');
    }
  }
);

const agentsSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch agents
      .addCase(fetchAgents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.agents = action.payload;
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create agent
      .addCase(createAgent.fulfilled, (state, action) => {
        state.agents.push(action.payload);
      })
      // Update agent
      .addCase(updateAgent.fulfilled, (state, action) => {
        const index = state.agents.findIndex(agent => agent.id === action.payload.id);
        if (index !== -1) {
          state.agents[index] = action.payload;
        }
      })
      // Delete agent
      .addCase(deleteAgent.fulfilled, (state, action) => {
        state.agents = state.agents.filter(agent => agent.id !== action.payload);
      });
  },
});

export const { clearError } = agentsSlice.actions;
export default agentsSlice.reducer;