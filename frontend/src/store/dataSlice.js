import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  laws: [],
  totalLaws: 0,
  stats: null,
  analytics: null,
  loading: false,
  error: null,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setLawsData: (state, action) => {
      state.laws = action.payload.laws;
      state.totalLaws = action.payload.totalLaws || action.payload.laws.length;
    },
    setStatsData: (state, action) => {
      state.stats = action.payload;
    },
    setAnalyticsData: (state, action) => {
      state.analytics = action.payload;
    },
    setDataLoading: (state, action) => {
      state.loading = action.payload;
    },
    setDataError: (state, action) => {
      state.error = action.payload;
    }
  },
});

export const { 
  setLawsData, 
  setStatsData, 
  setAnalyticsData, 
  setDataLoading, 
  setDataError 
} = dataSlice.actions;

export default dataSlice.reducer;
