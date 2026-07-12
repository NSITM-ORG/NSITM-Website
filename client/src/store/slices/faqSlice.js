/**
 * FAQ Slice — Public grouped-by-category listing + Super Admin CMS-lite
 * management (free-text categories + suggestion list, per confirmed decision).
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import httpClient from '../../api/httpClient.js';
import API from '../../api/endpoints.js';

export const fetchPublishedFaqs = createAsyncThunk(
  'faqs/fetchPublished',
  async (_, { rejectWithValue }) => {
    try {
      return (await httpClient.get(API.PUBLIC.FAQS)).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchAllFaqsAdmin = createAsyncThunk(
  'faqs/fetchAllAdmin',
  async (filters, { rejectWithValue }) => {
    try {
      return await httpClient.get(API.SUPERADMIN.FAQS, filters);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchFaqCategories = createAsyncThunk(
  'faqs/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return (await httpClient.get(API.SUPERADMIN.FAQ_CATEGORIES)).data.categories;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createFaq = createAsyncThunk('faqs/create', async (payload, { rejectWithValue }) => {
  try {
    return (await httpClient.post(API.SUPERADMIN.FAQS, payload)).data;
  } catch (err) {
    return rejectWithValue(err);
  }
});

export const updateFaq = createAsyncThunk(
  'faqs/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return (await httpClient.patch(API.SUPERADMIN.FAQ_BY_ID(id), data)).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const deleteFaq = createAsyncThunk('faqs/delete', async (id, { rejectWithValue }) => {
  try {
    await httpClient.del(API.SUPERADMIN.FAQ_BY_ID(id));
    return id;
  } catch (err) {
    return rejectWithValue(err);
  }
});

const initialState = {
  publishedGrouped: {}, // { Enrollment: [...], Payment: [...], ... }
  adminList: [],
  categories: [],
  pagination: { total: 0, page: 1, limit: 25, totalPages: 0 },
  loading: false,
  submitting: false,
  error: null,
};

const faqSlice = createSlice({
  name: 'faqs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublishedFaqs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPublishedFaqs.fulfilled, (state, action) => {
        state.loading = false;
        state.publishedGrouped = action.payload.faqs;
      })
      .addCase(fetchPublishedFaqs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllFaqsAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllFaqsAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.adminList = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllFaqsAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFaqCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(createFaq.pending, (state) => {
        state.submitting = true;
      })
      .addCase(createFaq.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(createFaq.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(updateFaq.fulfilled, (state, action) => {
        const idx = state.adminList.findIndex((f) => f.id === action.payload.faq.id);
        if (idx !== -1) state.adminList[idx] = action.payload.faq;
      })
      .addCase(deleteFaq.fulfilled, (state, action) => {
        state.adminList = state.adminList.filter((f) => f.id !== action.payload);
      });
  },
});

export default faqSlice.reducer;