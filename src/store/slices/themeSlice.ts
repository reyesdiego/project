import { createSlice } from '@reduxjs/toolkit';

interface ThemeState {
  isDarkMode: boolean;
}

const initialState: ThemeState = {
  isDarkMode: localStorage.getItem('theme') === 'dark',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
      localStorage.setItem('theme', state.isDarkMode ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', state.isDarkMode);
    },
    setTheme: (state, action) => {
      state.isDarkMode = action.payload;
      localStorage.setItem('theme', state.isDarkMode ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', state.isDarkMode);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;