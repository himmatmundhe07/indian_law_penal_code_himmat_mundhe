import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import { API_ROUTES } from '../utils/constants';

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, thunkAPI) => {
    try {
      const response = await api.get(API_ROUTES.PROFILE);
      return response.data.data || response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const toggleLawBookmark = createAsyncThunk(
  'auth/toggleBookmark',
  async ({ id, act }, thunkAPI) => {
    try {
      const response = await api.patch(`${API_ROUTES.LAWS}/${id}/bookmark?act=${act}`);
      return response.data.bookmarks;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const getSafeUser = () => {
  const saved = localStorage.getItem('user');
  if (!saved || saved === 'undefined' || saved === 'null') return null;
  try { return JSON.parse(saved); } catch (e) { return null; }
};

const initialState = {
  token: localStorage.getItem('token') || null,
  user: getSafeUser(),
  isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProfile.fulfilled, (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    });
    builder.addCase(toggleLawBookmark.fulfilled, (state, action) => {
      if (state.user) {
        state.user.bookmarks = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    });
  }
});

export const { loginSuccess, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
