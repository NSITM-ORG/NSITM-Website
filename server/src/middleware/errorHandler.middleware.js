'use strict';

/**
 * Global Error Handler Middleware
 *
 * MUST be the last middleware registered in app.js.
 * Receives all errors passed to next(err) from anywhere in the stack.
 *
 * Produces the project's standard error response shape:
 * {
 *   "status": "error",
 *   "error": "SHORT_ERROR_CODE",
 *   "message": "Detailed error description or instruction"
 * }
 *
 * Handles:
 *   — ApiError instances (operational errors): formatted and returned as-is
 *   — Mongoose CastError (invalid ObjectId): converted to 400
 *   — Mongoose ValidationError: converted to 400 with combined field messages
 *   — Mongoose duplicate key error (code 11000): converted to 409
 *   — JWT JsonWebTokenError: converted to 401
 *   — JWT TokenExpiredError: converted to 401
 *   — Multer LIMIT_FILE_SIZE: converted to 400
 *   — Multer LIMIT_UNEXPECTED_FILE: converted to 400
 *   — CORS errors: converted to 403
 *   — All unrecognized errors: logged fully, generic 500 returned to client
 *
 * Stack traces are included in responses ONLY in development mode.
 */

import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  // Clone mutable fields so we don't mutate the original error object
  let statusCode = err.statusCode || 500;
  let errorCode = err.error || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred. Please try again or contact support.';

  // ── Mongoose: Bad ObjectId ──────────────────────────────────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_ID_FORMAT';
    message = `The value '${err.value}' is not a valid identifier format. Please check and try again.`;
  }

  // ── Mongoose: Schema Validation Failure ────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    const fieldErrors = Object.values(err.errors).map((e) => e.message);
    message = fieldErrors.join(' ');
  }

  // ── Mongoose: Duplicate Key (Unique Index Violation) ───────────────
  if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyValue || {})[0] || 'field';
    const duplicateValue = err.keyValue ? err.keyValue[duplicateField] : '';
    statusCode = 409;
    errorCode = 'DUPLICATE_FIELD_VALUE';
    message = `A record with this ${duplicateField} ('${duplicateValue}') already exists. Please use a different value.`;
  }

  // ── JWT: Malformed or tampered token ──────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = 'Your session token is invalid or has been tampered with. Please log in again.';
  }

  // ── JWT: Token has passed its expiry time ────────────────────────
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Your session token has expired. Please log in again to continue.';
  }

  // ── Multer: Uploaded file exceeds size limit ──────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    errorCode = 'FILE_TOO_LARGE';
    message = 'The uploaded file exceeds the maximum allowed size of 5MB. Please compress the file and try again.';
  }

  // ── Multer: File uploaded to an unexpected field name ─────────────
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    errorCode = 'UNEXPECTED_FILE_FIELD';
    message = 'A file was uploaded to an unexpected field. Please use the correct upload field name.';
  }

  // ── Multer: No file in expected field ────────────────────────────
  if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.type === 'entity.too.large') {
    statusCode = 400;
    errorCode = 'REQUEST_TOO_LARGE';
    message = 'The request payload is too large. Please reduce the size and try again.';
  }

  // ── CORS: Origin not in allowed list ─────────────────────────────
  if (err.message && err.message.startsWith('CORS:')) {
    statusCode = 403;
    errorCode = 'CORS_FORBIDDEN';
    message = 'This origin is not permitted to access this resource.';
  }

  // ── Log all errors ────────────────────────────────────────────────
  if (statusCode >= 500) {
    // Server errors: full details including stack trace
    logger.error('Server Error', {
      statusCode,
      errorCode,
      message,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      stack: err.stack,
      isOperational: err.isOperational || false,
    });
  } else {
    // Client errors: minimal logging without stack trace
    logger.warn('Client Error', {
      statusCode,
      errorCode,
      message,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    });
  }

  // ── Send standard error response ──────────────────────────────────
  return res.status(statusCode).json({
    status: 'error',
    error: errorCode,
    message,
    // Attach validation field-level details when present (from validate.middleware.js)
    ...(err.details && { details: err.details }),
    // Include stack trace only in development — never in production
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      originalError: err.name,
    }),
  });
};

export default errorHandler;