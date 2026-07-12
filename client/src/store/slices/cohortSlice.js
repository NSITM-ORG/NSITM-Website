/**
 * Cohort Slice — Public active-cohort listing + Super Admin management.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import httpClient from '../../api/httpClient.js';
import API from '../../api/endpoints.js';

export const fetchActiveCohorts = createAsyncThunk(
  'cohorts/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      return (await httpClient.get(API.PUBLIC.COHORTS_ACTIVE)).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchCohortById = createAsyncThunk(
  'cohorts/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return (await httpClient.get(API.PUBLIC.COHORT_BY_ID(id))).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchAdminCohorts = createAsyncThunk(
  'cohorts/fetchAdmin',
  async (filters, { rejectWithValue }) => {
    try {
      return await httpClient.get(API.SUPERADMIN.COHORTS, filters);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchCohortByIdAdmin = createAsyncThunk(
  'cohorts/fetchByIdAdmin',
  async (id, { rejectWithValue }) => {
    try {
      return (await httpClient.get(API.SUPERADMIN.COHORT_BY_ID(id))).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createCohort = createAsyncThunk('cohorts/create', async (payload, { rejectWithValue }) => {
  try {
    return (await httpClient.post(API.SUPERADMIN.COHORTS, payload)).data;
  } catch (err) {
    return rejectWithValue(err);
  }
});

export const updateCohort = createAsyncThunk(
  'cohorts/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return (await httpClient.patch(API.SUPERADMIN.COHORT_BY_ID(id), data)).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const deleteCohort = createAsyncThunk('cohorts/delete', async (id, { rejectWithValue }) => {
  try {
    await httpClient.del(API.SUPERADMIN.COHORT_BY_ID(id));
    return id;
  } catch (err) {
    return rejectWithValue(err);
  }
});

const initialState = {
  activeCohorts: [],
  adminList: [],
  currentCohort: null,
  pagination: { total: 0, page: 1, limit: 25, totalPages: 0 },
  loading: false,
  submitting: false,
  error: null,
};

const cohortSlice = createSlice({
  name: 'cohorts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveCohorts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchActiveCohorts.fulfilled, (state, action) => {
        state.loading = false;
        state.activeCohorts = action.payload.cohorts;
      })
      .addCase(fetchActiveCohorts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCohortById.fulfilled, (state, action) => {
        state.currentCohort = action.payload.cohort;
      })
      .addCase(fetchCohortByIdAdmin.fulfilled, (state, action) => {
        state.currentCohort = action.payload.cohort;
      })
      .addCase(fetchAdminCohorts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminCohorts.fulfilled, (state, action) => {
        state.loading = false;
        state.adminList = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAdminCohorts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCohort.pending, (state) => {
        state.submitting = true;
      })
      .addCase(createCohort.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(createCohort.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(updateCohort.pending, (state) => {
        state.submitting = true;
      })
      .addCase(updateCohort.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(updateCohort.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(deleteCohort.fulfilled, (state, action) => {
        state.adminList = state.adminList.filter((c) => c.id !== action.payload);
      });
  },
});

export default cohortSlice.reducer;