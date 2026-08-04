/* eslint-disable no-unused-vars */
/**
 * Centralized fetch() Wrapper — The ONLY place in the app that calls fetch().
 *
 * Every Redux thunk's payloadCreator is a 2–3 line call into one of the
 * verb methods below. This is where request/response normalization,
 * error typing, and auth-session-expiry handling live — exactly once,
 * instead of duplicated across 60+ thunks.
 *
 * NORMALIZED SUCCESS SHAPE (matches the backend's standard response contract):
 *   { data, message, pagination? }
 *
 * NORMALIZED ERROR SHAPE (thrown as an ApiError instance):
 *   { code: 'SHORT_ERROR_CODE', message: 'Human readable.', status: 422, details?: [...] }
 *
 * SESSION HANDLING:
 *   Every request sends credentials: 'include' — this is what makes the
 *   HTTP-only nsitm_session cookie travel with cross-origin requests
 *   (see backend token.service.js: sameSite:'none' + secure:true in
 *   production specifically enables this pairing).
 *
 *   On a 401 (NOT_AUTHENTICATED / SESSION_EXPIRED / TOKEN_INVALIDATED /
 *   TOKEN_EXPIRED / PASSWORD_CHANGED), this client dispatches a global
 *   'nsitm:session-expired' DOM CustomEvent instead of importing the
 *   Redux store directly (avoids a circular import between the store and
 *   the API layer). authSlice's initialization code (Batch F3) listens
 *   for this event and clears the session + redirects — see useAuth.js.
 *
 * FILE UPLOADS:
 *   postForm() intentionally does NOT set a Content-Type header — the
 *   browser sets the correct multipart/form-data boundary automatically
 *   when the body is a FormData instance. Setting it manually is a very
 *   common bug that breaks multipart parsing on the server.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * ApiError — thrown by every failed request. Thunks catch nothing extra;
 * createAsyncThunk's rejectWithValue receives this shape directly.
 */
export class ApiError extends Error {
  constructor({ code, message, status, details }) {
    super(message);
    this.name = 'ApiError';
    this.code = code || 'UNKNOWN_ERROR';
    this.status = status || 0;
    this.details = details || null;
  }
}

/**
 * Core request function. All verb helpers below delegate to this.
 *
 * @param {string} path - Endpoint path (from endpoints.js), e.g. '/public/programmes'
 * @param {RequestInit} [options] - Standard fetch options (method, body, headers)
 * @returns {Promise<{ data: any, message: string, pagination?: object }>}
 * @throws {ApiError}
 */
async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;

  console.log('url', url)
  let response;
  try {
    response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers: {
        ...(options.body && !(options.body instanceof FormData)
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...options.headers,
      },
    });
  } catch (networkErr) {
    // fetch() itself throws only on network failure (offline, DNS, CORS
    // preflight rejection) — never on HTTP error status codes.
    throw new ApiError({
      code: 'NETWORK_ERROR',
      message: 'Unable to reach the server. Please check your connection and try again.',
      status: 0,
    });
  }

  // Some endpoints (CSV export) return raw text/csv, not JSON.
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    // Session-expiry family of error codes → notify the app globally.
    const SESSION_ERROR_CODES = [
      'NOT_AUTHENTICATED',
      'SESSION_EXPIRED',
      'TOKEN_INVALIDATED',
      'TOKEN_EXPIRED',
      'PASSWORD_CHANGED',
      'ACCOUNT_NOT_FOUND',
    ];
    if (response.status === 401 && body?.error && SESSION_ERROR_CODES.includes(body.error)) {
      window.dispatchEvent(new CustomEvent('nsitm:session-expired'));
    }

    throw new ApiError({
      code: body?.error || 'UNKNOWN_ERROR',
      message: body?.message || 'Something went wrong. Please try again.',
      status: response.status,
      details: body?.details || null,
    });
  }

  if (!isJson) {
    // CSV / raw text response — return as-is under `data` for consistency.
    return { data: body, message: 'File retrieved.', raw: true, headers: response.headers };
  }

  return {
    data: body.data,
    message: body.message,
    pagination: body.pagination,
  };
}

/** GET request. `params` is auto-serialized to a query string. */
export function get(path, params) {
  const query = params
    ? '?' +
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&')
    : '';
  return request(`${path}${query}`, { method: 'GET' });
}

/** POST request with a JSON body. */
export function post(path, body) {
  return request(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
}

/** POST request with a FormData body (file uploads). No Content-Type set — see docstring. */
export function postForm(path, formData) {
  return request(path, { method: 'POST', body: formData });
}

/** PATCH request with a JSON body. */
export function patch(path, body) {
  return request(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });
}

/** PUT request with a JSON body. */
export function put(path, body) {
  return request(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined });
}

/** DELETE request. */
export function del(path, body) {
  return request(path, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined });
}

/**
 * Downloads a raw response (e.g. CSV export) directly to the browser as
 * a file, bypassing the JSON-normalization path entirely since the
 * response is never JSON here.
 *
 * @param {string} path
 * @param {object} [params]
 * @param {string} [suggestedFilename] - Fallback if Content-Disposition is missing
 */
export async function downloadFile(path, params, suggestedFilename = 'download.csv') {
  const query = params
    ? '?' +
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&')
    : '';

  const response = await fetch(`${BASE_URL}${path}${query}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError({
      code: body?.error || 'DOWNLOAD_FAILED',
      message: body?.message || 'Failed to download the file.',
      status: response.status,
    });
  }

  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition') || '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match ? match[1] : suggestedFilename;

  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export const httpClient = { get, post, postForm, patch, put, del, downloadFile };
export default httpClient;