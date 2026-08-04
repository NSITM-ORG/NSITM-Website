/**
 * Cohort Slice — Public active-cohort listing + Super Admin management.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import httpClient from '../../api/httpClient';
import API from '../../api/endpoints';

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

export const fetchCompletedCohorts = createAsyncThunk('cohorts/fetchCompleted', async (_, { rejectWithValue }) => {
  try { return (await httpClient.get(API.PUBLIC.COHORTS_COMPLETED)).data; } catch (err) { return rejectWithValue(err); }
});

export const checkCohortsExist = createAsyncThunk('cohorts/checkExist', async (_, { rejectWithValue }) => {
  try { return (await httpClient.get(API.PUBLIC.COHORTS_EXISTS)).data; } catch (err) { return rejectWithValue(err); }
});

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

export const bulkUpdateCohorts = createAsyncThunk(
  'cohorts/bulkUpdate',
  async ({ ids, updates }, { rejectWithValue }) => {
    try {
      return (await httpClient.patch(API.SUPERADMIN.COHORTS_BULK_UPDATE, { ids, updates })).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const bulkDeleteCohorts = createAsyncThunk(
  'cohorts/bulkDelete',
  async (ids, { rejectWithValue }) => {
    try {
      return (await httpClient.del(API.SUPERADMIN.COHORTS_BULK_DELETE, { ids })).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);


const initialState = {
  activeCohorts: [],
  adminList: [],
  currentCohort: null,
  pagination: { total: 0, page: 1, limit: 25, totalPages: 0 },
  loading: false,
  submitting: false,
  error: null,
  completedCohorts: [],
  cohortsExist: false,
  cohortsExistChecked: false,
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
      .addCase(fetchCompletedCohorts.fulfilled, (state, action) => {
        state.completedCohorts = action.payload.cohorts;
      })
      .addCase(checkCohortsExist.fulfilled, (state, action) => {
        state.cohortsExist = action.payload.exists;
        state.cohortsExistChecked = true;
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
      })
      .addCase(bulkUpdateCohorts.pending, (state) => {
        state.submitting = true;
      })
      .addCase(bulkUpdateCohorts.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(bulkUpdateCohorts.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(bulkDeleteCohorts.fulfilled, (state, action) => {
        const deletedIds = new Set(action.payload.deleted.map((d) => d.id));
        state.adminList = state.adminList.filter((c) => !deletedIds.has(c.id));
      });
  },
});

export default cohortSlice.reducer;