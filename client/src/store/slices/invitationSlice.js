/**
 * Invitation Slice — Super Admin's invite-management + the PUBLIC
 * invitation-completion flow (verify → resend-code → complete).
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import httpClient from '../../api/httpClient';
import API from '../../api/endpoints';

// ── Super Admin ───────────────────────────────────────────────────
export const createInvitation = createAsyncThunk(
  'invitations/create',
  async (payload, { rejectWithValue }) => {
    try {
      return (await httpClient.post(API.SUPERADMIN.INVITE_ADMIN, payload)).message;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchInvitations = createAsyncThunk(
  'invitations/fetchAll',
  async (filters, { rejectWithValue }) => {
    try {
      return await httpClient.get(API.SUPERADMIN.INVITATIONS, filters);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const resendInvitationCode = createAsyncThunk(
  'invitations/resend',
  async (id, { rejectWithValue }) => {
    try {
      return (await httpClient.post(API.SUPERADMIN.INVITATION_RESEND(id))).message;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const revokeInvitation = createAsyncThunk(
  'invitations/revoke',
  async (id, { rejectWithValue }) => {
    try {
      await httpClient.post(API.SUPERADMIN.INVITATION_REVOKE(id));
      return id;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// ── Public — invitation completion ───────────────────────────────
export const verifyInvitation = createAsyncThunk(
  'invitations/verify',
  async ({ token, code }, { rejectWithValue }) => {
    try {
      return (await httpClient.get(API.ADMIN_REGISTRATION.VERIFY, { token, code })).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const requestNewInvitationCode = createAsyncThunk(
  'invitations/requestNewCode',
  async (token, { rejectWithValue }) => {
    try {
      return (await httpClient.post(API.ADMIN_REGISTRATION.RESEND_CODE, { token })).message;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const completeRegistration = createAsyncThunk(
  'invitations/completeRegistration',
  async (payload, { rejectWithValue }) => {
    try {
      return (await httpClient.post(API.ADMIN_REGISTRATION.COMPLETE, payload)).message;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const initialState = {
  list: [],
  pagination: { total: 0, page: 1, limit: 25, totalPages: 0 },
  verifiedEmail: null,
  loading: false,
  submitting: false,
  error: null,
};

const invitationSlice = createSlice({
  name: 'invitations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createInvitation.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createInvitation.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(createInvitation.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(fetchInvitations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInvitations.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchInvitations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(revokeInvitation.fulfilled, (state, action) => {
        const inv = state.list.find((i) => i.id === action.payload);
        if (inv) inv.isInvalidated = true;
      })
      .addCase(verifyInvitation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyInvitation.fulfilled, (state, action) => {
        state.loading = false;
        state.verifiedEmail = action.payload.email;
      })
      .addCase(verifyInvitation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.verifiedEmail = null;
      })
      .addCase(completeRegistration.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(completeRegistration.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(completeRegistration.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });
  },
});

export default invitationSlice.reducer;