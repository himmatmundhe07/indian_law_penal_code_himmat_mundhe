import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as analyticsService from '../../services/analyticsService';

export const loadAnalyticsDashboard = createAsyncThunk(
  'analytics/loadDashboard',
  async (_, thunkAPI) => {
    try {
      const [
        mostViewed, mostBookmarked, byCategory, byState,
        byCourt, recentUpdates, popularity, searchTrends,
        userActivity, complexity
      ] = await Promise.allSettled([
        analyticsService.fetchMostViewed(),
        analyticsService.fetchMostBookmarked(),
        analyticsService.fetchByCategory(),
        analyticsService.fetchByState(),
        analyticsService.fetchByCourt(),
        analyticsService.fetchRecentUpdates(),
        analyticsService.fetchPopularity(),
        analyticsService.fetchSearchTrends(),
        analyticsService.fetchUserActivity(),
        analyticsService.fetchComplexity(),
      ]);

      const safeValue = (result) =>
        result.status === 'fulfilled' ? result.value.data?.data || result.value.data : null;

      return {
        mostViewed:     safeValue(mostViewed),
        mostBookmarked: safeValue(mostBookmarked),
        byCategory:     safeValue(byCategory),
        byState:        safeValue(byState),
        byCourt:        safeValue(byCourt),
        recentUpdates:  safeValue(recentUpdates),
        popularity:     safeValue(popularity),
        searchTrends:   safeValue(searchTrends),
        userActivity:   safeValue(userActivity),
        complexity:     safeValue(complexity),
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    mostViewed:     null,
    mostBookmarked: null,
    byCategory:     null,
    byState:        null,
    byCourt:        null,
    recentUpdates:  null,
    popularity:     null,
    searchTrends:   null,
    userActivity:   null,
    complexity:     null,
    loading:        false,
    error:          null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAnalyticsDashboard.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(loadAnalyticsDashboard.fulfilled, (state, action) => {
        return { ...state, ...action.payload, loading: false };
      })
      .addCase(loadAnalyticsDashboard.rejected,  (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });
  },
});

export default analyticsSlice.reducer;
