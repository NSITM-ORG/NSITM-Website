'use strict';

/**
 * ApiError — Custom Operational Error Class
 *
 * All intentionally thrown errors in this project (invalid input,
 * unauthorized access, resource not found, business rule violations)
 * should use this class.
 *
 * This distinguishes them from programming errors (bugs) so the global
 * error handler can respond appropriately:
 *   - Operational errors (isOperational: true): send structured error response to client
 *   - Programming errors (isOperational: false): log stack trace, send generic 500 to client
 *
 * Error response shape produced by errorHandler.middleware.js:
 * {
 *   "status": "error",
 *   "error": "SHORT_ERROR_CODE",    ← machine-readable, for frontend error handling
 *   "message": "Detailed message"   ← human-readable, for display or debugging
 * }
 *
 * Usage:
 *   throw new ApiError(404, 'ENROLLMENT_NOT_FOUND', 'No enrollment record found with the provided ID.');
 *   throw new ApiError(403, 'PERMISSION_DENIED', 'You do not have permission to perform this action.');
 *   throw new ApiError(409, 'DUPLICATE_ENROLLMENT', 'An enrollment already exists for this email and programme.');
 *   next(new ApiError(400, 'INVALID_TOKEN', 'The provided token is expired or invalid.'));
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} error - Short, machine-readable error code (e.g. 'NOT_FOUND', 'UNAUTHORIZED')
   * @param {string} message - Human-readable error description or corrective instruction
   */
  constructor(statusCode, error, message) {
    super(message);

    this.statusCode = statusCode;
    this.error = error;
    this.message = message;
    this.status = 'error';
    this.isOperational = true; // Marks this as an expected, handled error (not a bug)

    // Capture the stack trace, excluding the constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;