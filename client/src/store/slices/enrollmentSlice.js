/**
 * Enrollment Slice — The core public enrollment flow (Steps 1–4) plus
 * the Admin/Super Admin enrollment record management views.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import httpClient from '../../api/httpClient.js';
import API from '../../api/endpoints.js';

// ── Public — Step 1: create/update partial record ──────────────────
export const createPartialRecord = createAsyncThunk(
  'enrollments/createPartial',
  async (payload, { rejectWithValue }) => {
    try {
      return (await httpClient.post(API.PUBLIC.ENROLLMENT_PARTIAL, payload)).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updatePartialProgramme = createAsyncThunk(
  'enrollments/updatePartialProgramme',
  async ({ id, programme }, { rejectWithValue }) => {
    try {
      return (await httpClient.patch(API.PUBLIC.ENROLLMENT_PARTIAL_UPDATE(id), { programme })).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// ── Public — Step 4: complete enrollment (multipart FormData) ──────
export const completeEnrollment = createAsyncThunk(
  'enrollments/complete',
  async (formData, { rejectWithValue }) => {
    try {
      return (await httpClient.postForm(API.PUBLIC.ENROLLMENT_COMPLETE, formData)).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// ── Admin / Super Admin ──────────────────────────────────────────────
export const fetchDashboardOverview = createAsyncThunk(
  'enrollments/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      return (await httpClient.get(API.ADMIN.DASHBOARD)).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchAllEnrollments = createAsyncThunk(
  'enrollments/fetchAll',
  async (filters, { rejectWithValue }) => {
    try {
      return await httpClient.get(API.ADMIN.ENROLLMENTS, filters);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchEnrollmentById = createAsyncThunk(
  'enrollments/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return (await httpClient.get(API.ADMIN.ENROLLMENT_BY_ID(id))).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

/** Super Admin: FRD FR-08.4 — permanently delete a stale 'Not Paid' record. */
export const archivePartialEnrollment = createAsyncThunk(
  'enrollments/archivePartial',
  async (id, { rejectWithValue }) => {
    try {
      await httpClient.del(API.SUPERADMIN.ENROLLMENT_ARCHIVE(id));
      return id;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const initialState = {
  list: [],
  currentEnrollment: null,
  instalmentSummary: null,
  dashboardMetrics: null,
  recentActivity: [],
  partialEnrollmentId: null,
  filters: { status: '', programme: '', cohort: '', fromDate: '', toDate: '', search: '' },
  pagination: { total: 0, page: 1, limit: 25, totalPages: 0 },
  loading: false,
  submitting: false,
  error: null,
};

const enrollmentSlice = createSlice({
  name: 'enrollments',
  initialState,
  reducers: {
    setEnrollmentFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPartialEnrollmentId(state, action) {
      state.partialEnrollmentId = action.payload;
    },
    clearPartialEnrollmentId(state) {
      state.partialEnrollmentId = null;
    },
    clearCurrentEnrollment(state) {
      state.currentEnrollment = null;
      state.instalmentSummary = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPartialRecord.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createPartialRecord.fulfilled, (state, action) => {
        state.submitting = false;
        state.partialEnrollmentId = action.payload.enrollmentId;
      })
      .addCase(createPartialRecord.rejected, (state, action) => {
        // Per FRD FR-08.1, a failure here must NOT block the form —
        // the component (EnrollmentPage) is responsible for advancing
        // the step regardless. We still record the error for the toast
        // middleware, but do not treat this as a hard stop.
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(updatePartialProgramme.fulfilled, () => {})
      .addCase(completeEnrollment.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(completeEnrollment.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(completeEnrollment.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(fetchDashboardOverview.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardMetrics = action.payload.metrics;
        state.recentActivity = action.payload.recentActivity;
      })
      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllEnrollments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEnrollmentById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEnrollmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEnrollment = action.payload.enrollment;
        state.instalmentSummary = action.payload.instalmentSummary;
      })
      .addCase(fetchEnrollmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(archivePartialEnrollment.fulfilled, (state, action) => {
        state.list = state.list.filter((e) => e.id !== action.payload);
      });
  },
});

export const {
  setEnrollmentFilters,
  setPartialEnrollmentId,
  clearPartialEnrollmentId,
  clearCurrentEnrollment,
} = enrollmentSlice.actions;
export default enrollmentSlice.reducer;