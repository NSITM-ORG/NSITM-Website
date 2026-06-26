'use strict';

/**
 * Standard API Response Helpers
 *
 * Every endpoint in this project returns one of three shapes.
 * These helpers enforce that contract uniformly across all controllers.
 *
 * ── Shape 1: Success (single resource or action result) ──
 * {
 *   "status": "success",
 *   "data": {},
 *   "message": "Human-readable success message"
 * }
 *
 * ── Shape 2: Paginated Success (list of resources) ──
 * {
 *   "status": "success",
 *   "data": [],
 *   "message": "Human-readable success message",
 *   "pagination": {
 *     "total": 120,
 *     "page": 1,
 *     "limit": 25,
 *     "totalPages": 5
 *   }
 * }
 *
 * ── Shape 3: Error (handled by errorHandler.middleware.js) ──
 * {
 *   "status": "error",
 *   "error": "SHORT_ERROR_CODE",
 *   "message": "Detailed error description or instruction"
 * }
 *
 * Usage in controllers:
 *   const { sendSuccess, sendPaginated } = require('../utils/ApiResponse');
 *   return sendSuccess(res, 200, { user }, 'Profile retrieved successfully.');
 *   return sendPaginated(res, 200, students, 'Students retrieved.', paginationMeta);
 */

/**
 * Send a standard success response.
 *
 * @param {import('express').Response} res - Express response object
 * @param {number} statusCode - HTTP status code (e.g. 200, 201)
 * @param {Object|Array|null} data - The response payload (object, array, or null for actions)
 * @param {string} message - Human-readable success message
 * @returns {import('express').Response}
 */
const sendSuccess = (res, statusCode, data, message) => {
  return res.status(statusCode).json({
    status: 'success',
    data: data !== undefined ? data : null,
    message,
  });
};

/**
 * Send a paginated success response for list endpoints.
 *
 * @param {import('express').Response} res - Express response object
 * @param {number} statusCode - HTTP status code (typically 200)
 * @param {Array} data - Array of resource items for the current page
 * @param {string} message - Human-readable success message
 * @param {{ total: number, page: number, limit: number, totalPages: number }} pagination
 * @returns {import('express').Response}
 */
const sendPaginated = (res, statusCode, data, message, pagination) => {
  return res.status(statusCode).json({
    status: 'success',
    data,
    message,
    pagination: {
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
    },
  });
};

export
 { sendSuccess, sendPaginated };