/**
 * Settings Slice — Public payment-page settings (bank/WhatsApp) +
 * Super Admin full settings management.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import httpClient from '../../api/httpClient';
import API from '../../api/endpoints';

export const fetchPublicSettings = createAsyncThunk(
  'settings/fetchPublic',
  async (_, { rejectWithValue }) => {
    try {
      return (await httpClient.get(API.PUBLIC.SETTINGS)).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchFullSettings = createAsyncThunk(
  'settings/fetchFull',
  async (_, { rejectWithValue }) => {
    try {
      return (await httpClient.get(API.SUPERADMIN.SETTINGS)).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateSettings = createAsyncThunk(
  'settings/update',
  async (payload, { rejectWithValue }) => {
    try {
      return (await httpClient.put(API.SUPERADMIN.SETTINGS, payload)).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const initialState = {
  settings: null,
  publicSettings: null,
  loading: false,
  saving: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPublicSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.publicSettings = action.payload;
      })
      .addCase(fetchPublicSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFullSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFullSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload.settings;
      })
      .addCase(fetchFullSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSettings.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.saving = false;
        state.settings = action.payload.settings;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export default settingsSlice.reducer;