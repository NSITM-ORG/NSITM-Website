/**
 * Legal Pages Slice — Public page fetching + Admin CRUD.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import httpClient from '../../api/httpClient';
import API from '../../api/endpoints';

// We need to add legal page endpoints to API config, but we can hardcode here for now,
// or use relative paths since httpClient supports it.

export const fetchPublicLegalPage = createAsyncThunk(
  'legalPages/fetchPublic',
  async (slug, { rejectWithValue }) => {
    try {
      return (await httpClient.get(`/public/legal-pages/${slug}`)).data.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchAllLegalPagesAdmin = createAsyncThunk(
  'legalPages/fetchAllAdmin',
  async (_, { rejectWithValue }) => {
    try {
      return (await httpClient.get('/admin/legal-pages')).data.pages;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchLegalPageAdmin = createAsyncThunk(
  'legalPages/fetchAdmin',
  async (slug, { rejectWithValue }) => {
    try {
      return (await httpClient.get(`/admin/legal-pages/${slug}`)).data.page;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateLegalPage = createAsyncThunk(
  'legalPages/update',
  async ({ slug, payload }, { rejectWithValue }) => {
    try {
      return (await httpClient.put(`/admin/legal-pages/${slug}`, payload)).data.page;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const publishLegalPage = createAsyncThunk(
  'legalPages/publish',
  async (slug, { rejectWithValue }) => {
    try {
      return (await httpClient.patch(`/admin/legal-pages/${slug}/publish`)).data.page;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const initialState = {
  list: [],
  currentPage: null,
  publicPage: null,
  loading: false,
  saving: false,
  error: null,
};

const legalPageSlice = createSlice({
  name: 'legalPages',
  initialState,
  reducers: {
    clearCurrentLegalPage(state) {
      state.currentPage = null;
    },
    clearPublicLegalPage(state) {
      state.publicPage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Public
      .addCase(fetchPublicLegalPage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicLegalPage.fulfilled, (state, action) => {
        state.loading = false;
        state.publicPage = action.payload;
      })
      .addCase(fetchPublicLegalPage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch All Admin
      .addCase(fetchAllLegalPagesAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllLegalPagesAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAllLegalPagesAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Admin (single)
      .addCase(fetchLegalPageAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLegalPageAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPage = action.payload;
      })
      .addCase(fetchLegalPageAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Admin
      .addCase(updateLegalPage.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateLegalPage.fulfilled, (state, action) => {
        state.saving = false;
        state.currentPage = action.payload;
      })
      .addCase(updateLegalPage.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      // Publish Admin
      .addCase(publishLegalPage.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(publishLegalPage.fulfilled, (state, action) => {
        state.saving = false;
        state.currentPage = action.payload;
        // Also update in list if present
        const index = state.list.findIndex(p => p.slug === action.payload.slug);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(publishLegalPage.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentLegalPage, clearPublicLegalPage } = legalPageSlice.actions;
export default legalPageSlice.reducer;
