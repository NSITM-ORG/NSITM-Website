/**
 * UI Slice — Toasts, modal open/close flags, and sidebar collapse state.
 * The only slice that is NOT backed by a backend endpoint — pure client UI state.
 */

import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  toasts: [], // [{ id, type: 'success'|'error'|'info', message, duration }]
  modals: {
    confirm: false,
    logout: false,
    programmeForm: false,
    cohortForm: false,
  },
  sidebarCollapsed: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addToast: {
      reducer(state, action) {
        state.toasts.push(action.payload);
      },
      prepare({ type = 'info', message, duration = 4000 }) {
        return { payload: { id: nanoid(), type, message, duration } };
      },
    },
    removeToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    openModal(state, action) {
      state.modals[action.payload] = true;
    },
    closeModal(state, action) {
      state.modals[action.payload] = false;
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, action) {
      state.sidebarCollapsed = action.payload;
    },
  },
});

export const { addToast, removeToast, openModal, closeModal, toggleSidebar, setSidebarCollapsed } =
  uiSlice.actions;
export default uiSlice.reducer;