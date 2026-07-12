/**
 * Payment Slice — Status transitions on enrollment records
 * (Confirm/Reject by Admin+SuperAdmin, Reversal by SuperAdmin only).
 *
 * This slice does NOT hold a copy of enrollment data — it only tracks
 * the in-flight `updating` state for action buttons, since the source
 * of truth (the enrollment record itself) lives in enrollmentSlice and
 * is re-fetched by the calling component after a successful mutation.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import httpClient from '../../api/httpClient.js';
import API from '../../api/endpoints.js';

export const updatePaymentStatus = createAsyncThunk(
  'payments/updateStatus',
  async ({ id, paymentStatus, rejectionReason }, { rejectWithValue }) => {
    try {
      return (
        await httpClient.patch(API.ADMIN.PAYMENT_STATUS(id), { paymentStatus, rejectionReason })
      ).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const reversePaymentStatus = createAsyncThunk(
  'payments/reverse',
  async ({ id, reversalReason }, { rejectWithValue }) => {
    try {
      return (await httpClient.patch(API.SUPERADMIN.PAYMENT_REVERSE(id), { reversalReason })).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const initialState = { updating: false, error: null };

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (a) => [updatePaymentStatus.pending.type, reversePaymentStatus.pending.type].includes(a.type),
        (state) => {
          state.updating = true;
          state.error = null;
        }
      )
      .addMatcher(
        (a) =>
          [updatePaymentStatus.fulfilled.type, reversePaymentStatus.fulfilled.type].includes(a.type),
        (state) => {
          state.updating = false;
        }
      )
      .addMatcher(
        (a) => [updatePaymentStatus.rejected.type, reversePaymentStatus.rejected.type].includes(a.type),
        (state, action) => {
          state.updating = false;
          state.error = action.payload;
        }
      );
  },
});

export default paymentSlice.reducer;