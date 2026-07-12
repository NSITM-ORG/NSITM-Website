/**
 * Contact Message Slice — Footer "Send Us a Message" form (public) +
 * Admin/Super Admin inbox.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import httpClient from '../../api/httpClient.js';
import API from '../../api/endpoints.js';

export const createContactMessage = createAsyncThunk(
  'contactMessages/create',
  async (payload, { rejectWithValue }) => {
    try {
      return (await httpClient.post(API.PUBLIC.CONTACT_MESSAGES, payload)).message;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchContactMessages = createAsyncThunk(
  'contactMessages/fetchAll',
  async (filters, { rejectWithValue }) => {
    try {
      return await httpClient.get(API.ADMIN.CONTACT_MESSAGES, filters);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateContactMessageStatus = createAsyncThunk(
  'contactMessages/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return (await httpClient.patch(API.ADMIN.CONTACT_MESSAGE_STATUS(id), { status })).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const initialState = {
  list: [],
  pagination: { total: 0, page: 1, limit: 25, totalPages: 0 },
  loading: false,
  submitting: false,
  error: null,
};

const contactMessageSlice = createSlice({
  name: 'contactMessages',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createContactMessage.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createContactMessage.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(createContactMessage.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(fetchContactMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchContactMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchContactMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateContactMessageStatus.fulfilled, (state, action) => {
        const idx = state.list.findIndex((m) => m.id === action.payload.contactMessage.id);
        if (idx !== -1) state.list[idx] = action.payload.contactMessage;
      });
  },
});

export default contactMessageSlice.reducer;