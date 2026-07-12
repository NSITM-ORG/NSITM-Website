/**
 * Analytics Slice — Super Admin dashboard metrics + CSV export.
 * `metrics.totalRecordedStudents` and `metrics.enrollmentTrend` power the
 * Super Admin shortcut cards specified in the original build instructions.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import httpClient from '../../api/httpClient.js';
import API from '../../api/endpoints.js';

export const fetchAnalyticsOverview = createAsyncThunk(
  'analytics/fetchOverview',
  async (dateRange, { rejectWithValue }) => {
    try {
      return (await httpClient.get(API.SUPERADMIN.ANALYTICS, dateRange)).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const exportStudentsCsv = createAsyncThunk(
  'analytics/export',
  async (filters, { rejectWithValue }) => {
    try {
      await httpClient.downloadFile(API.SUPERADMIN.EXPORT, filters, 'NSITM_Students.csv');
      return true;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const initialState = {
  metrics: null,
  exporting: false,
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalyticsOverview.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAnalyticsOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload;
      })
      .addCase(fetchAnalyticsOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(exportStudentsCsv.pending, (state) => {
        state.exporting = true;
      })
      .addCase(exportStudentsCsv.fulfilled, (state) => {
        state.exporting = false;
      })
      .addCase(exportStudentsCsv.rejected, (state, action) => {
        state.exporting = false;
        state.error = action.payload;
      });
  },
});

export default analyticsSlice.reducer;