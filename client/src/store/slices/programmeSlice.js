/**
 * Programme Slice — Public listing/detail + Super Admin management.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import httpClient from '../../api/httpClient.js';
import API from '../../api/endpoints.js';

export const fetchAllProgrammes = createAsyncThunk(
  'programmes/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return (await httpClient.get(API.PUBLIC.PROGRAMMES_ALL)).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchProgrammeBySlug = createAsyncThunk(
  'programmes/fetchBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      return (await httpClient.get(API.PUBLIC.PROGRAMME_BY_SLUG(slug))).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

/** params: { category, page, limit } — limit is 4/6/8 per responsive breakpoint. */
export const fetchProgrammesByCategory = createAsyncThunk(
  'programmes/fetchByCategory',
  async ({ category, page, limit }, { rejectWithValue }) => {
    try {
      const res = await httpClient.get(API.PUBLIC.PROGRAMMES_BY_CATEGORY(category), { page, limit });
      return res;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchAdminProgrammes = createAsyncThunk(
  'programmes/fetchAdmin',
  async (filters, { rejectWithValue }) => {
    try {
      return await httpClient.get(API.SUPERADMIN.PROGRAMMES, filters);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchProgrammeByIdAdmin = createAsyncThunk(
  'programmes/fetchByIdAdmin',
  async (id, { rejectWithValue }) => {
    try {
      return (await httpClient.get(API.SUPERADMIN.PROGRAMME_BY_ID(id))).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createProgramme = createAsyncThunk(
  'programmes/create',
  async (payload, { rejectWithValue }) => {
    try {
      return (await httpClient.post(API.SUPERADMIN.PROGRAMMES, payload)).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateProgramme = createAsyncThunk(
  'programmes/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return (await httpClient.patch(API.SUPERADMIN.PROGRAMME_BY_ID(id), data)).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const deleteProgramme = createAsyncThunk(
  'programmes/delete',
  async (id, { rejectWithValue }) => {
    try {
      await httpClient.del(API.SUPERADMIN.PROGRAMME_BY_ID(id));
      return id;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const initialState = {
  list: {}, // { tech_development: [], management: [], short_term: [] }
  currentProgramme: null,
  adminList: [],
  pagination: { total: 0, page: 1, limit: 8, totalPages: 0 },
  loading: false,
  submitting: false,
  error: null,
};

const programmeSlice = createSlice({
  name: 'programmes',
  initialState,
  reducers: {
    clearCurrentProgramme(state) {
      state.currentProgramme = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProgrammes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllProgrammes.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.programmes;
      })
      .addCase(fetchAllProgrammes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProgrammeBySlug.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProgrammeBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProgramme = action.payload.programme;
      })
      .addCase(fetchProgrammeBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProgrammesByCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProgrammesByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.adminList = action.payload.data; // reused field for category-page listing too
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProgrammesByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminProgrammes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminProgrammes.fulfilled, (state, action) => {
        state.loading = false;
        state.adminList = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAdminProgrammes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProgrammeByIdAdmin.fulfilled, (state, action) => {
        state.currentProgramme = action.payload.programme;
      })
      .addCase(createProgramme.pending, (state) => {
        state.submitting = true;
      })
      .addCase(createProgramme.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(createProgramme.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(updateProgramme.pending, (state) => {
        state.submitting = true;
      })
      .addCase(updateProgramme.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(updateProgramme.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(deleteProgramme.fulfilled, (state, action) => {
        state.adminList = state.adminList.filter((p) => p.id !== action.payload);
      });
  },
});

export const { clearCurrentProgramme } = programmeSlice.actions;
export default programmeSlice.reducer;