/**
 * Join Request Slice — "Join Our Community" public submission +
 * Super Admin review list (fixed 100/page server-side, per confirmed decision).
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import httpClient from '../../api/httpClient';
import API from '../../api/endpoints';

export const createJoinRequest = createAsyncThunk(
  'joinRequests/create',
  async (payload, { rejectWithValue }) => {
    try {
      return (await httpClient.post(API.PUBLIC.JOIN_REQUESTS, payload)).message;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchJoinRequests = createAsyncThunk(
  'joinRequests/fetchAll',
  async (filters, { rejectWithValue }) => {
    try {
      return await httpClient.get(API.SUPERADMIN.JOIN_REQUESTS, filters);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateJoinRequestStatus = createAsyncThunk(
  'joinRequests/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return (await httpClient.patch(API.SUPERADMIN.JOIN_REQUEST_STATUS(id), { status })).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const initialState = {
  list: [],
  pagination: { total: 0, page: 1, limit: 100, totalPages: 0 },
  loading: false,
  submitting: false,
  error: null,
};

const joinRequestSlice = createSlice({
  name: 'joinRequests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createJoinRequest.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createJoinRequest.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(createJoinRequest.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(fetchJoinRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJoinRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchJoinRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateJoinRequestStatus.fulfilled, (state, action) => {
        const idx = state.list.findIndex((r) => r.id === action.payload.joinRequest.id);
        if (idx !== -1) state.list[idx] = action.payload.joinRequest;
      });
  },
});

export default joinRequestSlice.reducer;