/**
 * Account Slice — Super Admin's Admin/Super Admin account management.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import httpClient from '../../api/httpClient.js';
import API from '../../api/endpoints.js';

export const fetchAllAccounts = createAsyncThunk(
  'accounts/fetchAll',
  async (filters, { rejectWithValue }) => {
    try {
      return await httpClient.get(API.SUPERADMIN.ACCOUNTS, filters);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchAccountById = createAsyncThunk(
  'accounts/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return (await httpClient.get(API.SUPERADMIN.ACCOUNT_BY_ID(id))).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateAccount = createAsyncThunk(
  'accounts/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return (await httpClient.patch(API.SUPERADMIN.ACCOUNT_BY_ID(id), data)).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const deactivateAccount = createAsyncThunk(
  'accounts/deactivate',
  async (id, { rejectWithValue }) => {
    try {
      await httpClient.patch(API.SUPERADMIN.ACCOUNT_DEACTIVATE(id));
      return id;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const reactivateAccount = createAsyncThunk(
  'accounts/reactivate',
  async (id, { rejectWithValue }) => {
    try {
      await httpClient.patch(API.SUPERADMIN.ACCOUNT_REACTIVATE(id));
      return id;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const deleteAccount = createAsyncThunk('accounts/delete', async (id, { rejectWithValue }) => {
  try {
    await httpClient.del(API.SUPERADMIN.ACCOUNT_BY_ID(id));
    return id;
  } catch (err) {
    return rejectWithValue(err);
  }
});

export const resetAccountPassword = createAsyncThunk(
  'accounts/resetPassword',
  async (id, { rejectWithValue }) => {
    try {
      return (await httpClient.post(API.SUPERADMIN.ACCOUNT_RESET_PASSWORD(id))).message;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const initialState = {
  list: [],
  currentAccount: null,
  pagination: { total: 0, page: 1, limit: 25, totalPages: 0 },
  loading: false,
  submitting: false,
  error: null,
};

const accountSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllAccounts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAccountById.fulfilled, (state, action) => {
        state.currentAccount = action.payload.account;
      })
      .addCase(updateAccount.pending, (state) => {
        state.submitting = true;
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.submitting = false;
        const idx = state.list.findIndex((a) => a.id === action.payload.account.id);
        if (idx !== -1) state.list[idx] = action.payload.account;
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(deactivateAccount.fulfilled, (state, action) => {
        const acc = state.list.find((a) => a.id === action.payload);
        if (acc) acc.isActive = false;
      })
      .addCase(reactivateAccount.fulfilled, (state, action) => {
        const acc = state.list.find((a) => a.id === action.payload);
        if (acc) acc.isActive = true;
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.list = state.list.filter((a) => a.id !== action.payload);
      });
  },
});

export default accountSlice.reducer;