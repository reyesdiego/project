import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import themeSlice from './slices/themeSlice';
import agentsSlice from './slices/agentsSlice';
import usersSlice from './slices/usersSlice';
import scoreTypesSlice from './slices/scoreTypesSlice';
import scoresSlice from './slices/scoresSlice';
import dashboardSlice from './slices/dashboardSlice';
import agentPointsSlice from './slices/agentPointsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    theme: themeSlice,
    agents: agentsSlice,
    users: usersSlice,
    scoreTypes: scoreTypesSlice,
    scores: scoresSlice,
    dashboard: dashboardSlice,
    agentPoints: agentPointsSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;