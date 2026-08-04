'use strict';

/**
 * asyncHandler — Async Route Handler Wrapper
 *
 * Eliminates the need for try-catch blocks in every async controller function.
 * Any error thrown inside the wrapped function is automatically caught and
 * forwarded to Express's next() for the global error handler to process.
 *
 * Usage:
 *   const asyncHandler = require('../utils/asyncHandler');
 *
 *   router.get('/example', asyncHandler(async (req, res, next) => {
 *     const data = await SomeModel.find();
 *     return sendSuccess(res, 200, data, 'Retrieved successfully.');
 *   }));
 *
 * Without this wrapper, an unhandled rejected promise in an async route
 * would crash the process (in older Node) or go unhandled (newer Node),
 * instead of being caught by the error middleware.
 *
 * @param {Function} fn - Async controller/middleware function to wrap
 * @returns {Function} Express middleware function with automatic error forwarding
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;