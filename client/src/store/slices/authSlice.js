/**
 * Auth Slice — Session state for both Admin and Super Admin.
 *
 * A single slice covers both roles (matches the backend's single Account
 * model with a `role` field) — the distinction between Admin-namespace
 * and Super-Admin-namespace endpoints (per the auth overhaul) is handled
 * by WHICH thunk is called, not by separate slices.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import httpClient from '../../api/httpClient.js';
import API from '../../api/endpoints.js';

// ── Admin namespace ─────────────────────────────────────────────────
export const adminLogin = createAsyncThunk('auth/adminLogin', async (payload, { rejectWithValue }) => {
  try {
    return (await httpClient.post(API.ADMIN_AUTH.LOGIN, payload)).data;
  } catch (err) {
    return rejectWithValue(err);
  }
});

export const adminForgotPassword = createAsyncThunk(
  'auth/adminForgotPassword',
  async (payload, { rejectWithValue }) => {
    try {
      return (await httpClient.post(API.ADMIN_AUTH.FORGOT_PASSWORD, payload)).message;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const adminResetPassword = createAsyncThunk(
  'auth/adminResetPassword',
  async (payload, { rejectWithValue }) => {
    try {
      return (await httpClient.post(API.ADMIN_AUTH.RESET_PASSWORD, payload)).message;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// ── Super Admin namespace ───────────────────────────────────────────
export const superAdminRegister = createAsyncThunk(
  'auth/superAdminRegister',
  async (payload, { rejectWithValue }) => {
    try {
      return (await httpClient.post(API.SUPERADMIN_AUTH.REGISTER, payload)).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const superAdminLogin = createAsyncThunk(
  'auth/superAdminLogin',
  async (payload, { rejectWithValue }) => {
    try {
      return (await httpClient.post(API.SUPERADMIN_AUTH.LOGIN, payload)).data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const superAdminForgotPassword = createAsyncThunk(
  'auth/superAdminForgotPassword',
  async (payload, { rejectWithValue }) => {
    try {
      return (await httpClient.post(API.SUPERADMIN_AUTH.FORGOT_PASSWORD, payload)).message;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const superAdminResetPassword = createAsyncThunk(
  'auth/superAdminResetPassword',
  async (payload, { rejectWithValue }) => {
    try {
      return (await httpClient.post(API.SUPERADMIN_AUTH.RESET_PASSWORD, payload)).message;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// ── Shared (role-agnostic once authenticated) ───────────────────────
export const logout = createAsyncThunk('auth/logout', async (_, { getState, rejectWithValue }) => {
  const role = getState().auth.user?.role;
  const endpoint = role === 'super_admin' ? API.SUPERADMIN_AUTH.LOGOUT : API.ADMIN_AUTH.LOGOUT;
  try {
    await httpClient.post(endpoint);
    return true;
  } catch (err) {
    return rejectWithValue(err);
  }
});

/**
 * getMe — Re-hydrates session on app mount. Tries the Admin `/me` first;
 * if that 401s AND no role hint exists yet, the caller (useAuth.js)
 * simply treats the user as logged out — there is no ambiguity in
 * practice because the cookie itself is role-specific to whichever
 * login endpoint issued it, so only the matching /me call will ever
 * succeed for a given active session.
 */
export const getMe = createAsyncThunk('auth/getMe', async (roleHint, { rejectWithValue }) => {
  const endpoint = roleHint === 'super_admin' ? API.SUPERADMIN_AUTH.ME : API.ADMIN_AUTH.ME;
  try {
    return (await httpClient.get(endpoint)).data;
  } catch (err) {
    return rejectWithValue(err);
  }
});

const initialState = {
  user: null, // { id, email, role, profile: { fullName, email, phone } }
  isAuthenticated: false,
  loading: false,
  submitting: false,
  error: null,
  bootstrapped: false, // true once the initial getMe() check has resolved (any outcome)
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    clearUser(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login (both namespaces resolve identically)
      .addMatcher(
        (action) => [adminLogin.pending.type, superAdminLogin.pending.type].includes(action.type),
        (state) => {
          state.submitting = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => [adminLogin.fulfilled.type, superAdminLogin.fulfilled.type].includes(action.type),
        (state, action) => {
          state.submitting = false;
          state.user = action.payload.account;
          state.isAuthenticated = true;
          state.bootstrapped = true;
        }
      )
      .addMatcher(
        (action) => [adminLogin.rejected.type, superAdminLogin.rejected.type].includes(action.type),
        (state, action) => {
          state.submitting = false;
          state.error = action.payload;
        }
      )
      // getMe (session bootstrap)
      .addCase(getMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.account;
        state.isAuthenticated = true;
        state.bootstrapped = true;
      })
      .addCase(getMe.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.bootstrapped = true;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      // Super Admin self-registration
      .addCase(superAdminRegister.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(superAdminRegister.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(superAdminRegister.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      // Forgot/Reset password (both namespaces — no state patch beyond flags,
      // message is returned directly to the calling component)
      .addMatcher(
        (action) =>
          [
            adminForgotPassword.pending.type,
            adminResetPassword.pending.type,
            superAdminForgotPassword.pending.type,
            superAdminResetPassword.pending.type,
          ].includes(action.type),
        (state) => {
          state.submitting = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          [
            adminForgotPassword.fulfilled.type,
            adminResetPassword.fulfilled.type,
            superAdminForgotPassword.fulfilled.type,
            superAdminResetPassword.fulfilled.type,
          ].includes(action.type),
        (state) => {
          state.submitting = false;
        }
      )
      .addMatcher(
        (action) =>
          [
            adminForgotPassword.rejected.type,
            adminResetPassword.rejected.type,
            superAdminForgotPassword.rejected.type,
            superAdminResetPassword.rejected.type,
          ].includes(action.type),
        (state, action) => {
          state.submitting = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearAuthError, clearUser } = authSlice.actions;
export default authSlice.reducer;