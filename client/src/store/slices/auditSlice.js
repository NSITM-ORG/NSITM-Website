/**
 * Audit Slice — Super Admin's password-reset trail (self + all Admins +
 * all Super Admins) and unauthorized-access log.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import httpClient from '../../api/httpClient.js';
import API from '../../api/endpoints.js';

export const fetchPasswordResetTrail = createAsyncThunk(
  'audit/fetchPasswordResets',
  async (filters, { rejectWithValue }) => {
    try {
      return await httpClient.get(API.SUPERADMIN.AUDIT_PASSWORD_RESETS, filters);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchUnauthorizedAccessTrail = createAsyncThunk(
  'audit/fetchUnauthorized',
  async (page, { rejectWithValue }) => {
    try {
      return await httpClient.get(API.SUPERADMIN.AUDIT_UNAUTHORIZED, { page });
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const initialState = {
  passwordResets: [],
  unauthorizedAccess: [],
  passwordResetsPagination: { total: 0, page: 1, limit: 25, totalPages: 0 },
  unauthorizedPagination: { total: 0, page: 1, limit: 25, totalPages: 0 },
  loading: false,
  error: null,
};

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPasswordResetTrail.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPasswordResetTrail.fulfilled, (state, action) => {
        state.loading = false;
        state.passwordResets = action.payload.data;
        state.passwordResetsPagination = action.payload.pagination;
      })
      .addCase(fetchPasswordResetTrail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUnauthorizedAccessTrail.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUnauthorizedAccessTrail.fulfilled, (state, action) => {
        state.loading = false;
        state.unauthorizedAccess = action.payload.data;
        state.unauthorizedPagination = action.payload.pagination;
      })
      .addCase(fetchUnauthorizedAccessTrail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default auditSlice.reducer;