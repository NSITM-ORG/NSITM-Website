/**
 * Instalment Slice — Public MyPayment flow + Admin instalment review.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import httpClient from '../../api/httpClient';
import API from '../../api/endpoints';

// ── Public ────────────────────────────────────────────────────────
export const requestInstalmentAccessLink = createAsyncThunk(
  'instalments/requestAccessLink',
  async (payload, { rejectWithValue }) => {
    try {
      return (await httpClient.post(API.PUBLIC.MY_PAYMENT, payload)).message;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const validateInstalmentToken = createAsyncThunk(
  'instalments/validateToken',
  async ({ token, email }, { rejectWithValue }) => {
    try {
      return (await httpClient.get(API.PUBLIC.MY_PAYMENT_ACCESS, { token, email })).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const submitInstalmentReceipt = createAsyncThunk(
  'instalments/submitReceipt',
  async (formData, { rejectWithValue }) => {
    try {
      return (await httpClient.postForm(API.PUBLIC.MY_PAYMENT_SUBMIT, formData)).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// ── Admin / Super Admin ──────────────────────────────────────────────
export const fetchOutstandingInstalments = createAsyncThunk(
  'instalments/fetchOutstanding',
  async (page, { rejectWithValue }) => {
    try {
      return await httpClient.get(API.ADMIN.INSTALMENTS_OUTSTANDING, { page });
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateInstalmentStatus = createAsyncThunk(
  'instalments/updateStatus',
  async ({ id, status, rejectionReason }, { rejectWithValue }) => {
    try {
      return (
        await httpClient.patch(API.ADMIN.INSTALMENT_STATUS(id), { status, rejectionReason })
      ).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const initialState = {
  outstandingList: [],
  outstandingPagination: { total: 0, page: 1, limit: 25, totalPages: 0 },
  accessSummary: null,
  loading: false,
  submitting: false,
  updating: false,
  error: null,
};

const instalmentSlice = createSlice({
  name: 'instalments',
  initialState,
  reducers: {
    clearAccessSummary(state) {
      state.accessSummary = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(requestInstalmentAccessLink.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(requestInstalmentAccessLink.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(requestInstalmentAccessLink.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(validateInstalmentToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateInstalmentToken.fulfilled, (state, action) => {
        state.loading = false;
        state.accessSummary = action.payload;
      })
      .addCase(validateInstalmentToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitInstalmentReceipt.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitInstalmentReceipt.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(submitInstalmentReceipt.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(fetchOutstandingInstalments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOutstandingInstalments.fulfilled, (state, action) => {
        state.loading = false;
        state.outstandingList = action.payload.data;
        state.outstandingPagination = action.payload.pagination;
      })
      .addCase(fetchOutstandingInstalments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateInstalmentStatus.pending, (state) => {
        state.updating = true;
      })
      .addCase(updateInstalmentStatus.fulfilled, (state) => {
        state.updating = false;
      })
      .addCase(updateInstalmentStatus.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      });
  },
});

export const { clearAccessSummary } = instalmentSlice.actions;
export default instalmentSlice.reducer;