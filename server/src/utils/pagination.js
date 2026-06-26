"use strict";

/**
 * Pagination Utilities
 *
 * Provides consistent pagination parameter parsing and metadata building
 * for all list endpoints in the API.
 *
 * Designed to work with the sendPaginated() helper in ApiResponse.js.
 *
 * Usage in a controller:
 *
 *   const { getPaginationParams, getPaginationMeta } = require('../utils/pagination');
 *
 *   const { page, limit, skip } = getPaginationParams(req.query);
 *   const total = await Enrollment.countDocuments(filter);
 *   const records = await Enrollment.find(filter).skip(skip).limit(limit);
 *   const paginationMeta = getPaginationMeta(total, page, limit);
 *
 *   return sendPaginated(res, 200, records, 'Records retrieved.', paginationMeta);
 */

import { PAGINATION } from "../config/constants.js";

/**
 * Parse and validate pagination parameters from the request query string.
 *
 * Rules:
 *   - Page must be >= 1 (defaults to PAGINATION.DEFAULT_PAGE if invalid or missing)
 *   - Limit must be >= 1 and <= PAGINATION.MAX_LIMIT (defaults to PAGINATION.DEFAULT_LIMIT)
 *   - Skip is computed from page and limit for use in MongoDB .skip()
 *
 * @param {Object} query - req.query object from the Express request
 * @returns {{ page: number, limit: number, skip: number }}
 */
const getPaginationParams = (query = {}) => {
  const page = Math.max(
    PAGINATION.DEFAULT_PAGE,
    parseInt(query.page, 10) || PAGINATION.DEFAULT_PAGE,
  );

  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT),
  );

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Build a pagination metadata object for inclusion in paginated responses.
 *
 * @param {number} total - Total number of documents matching the query (from countDocuments)
 * @param {number} page - Current page number
 * @param {number} limit - Number of items per page
 * @returns {{ total: number, page: number, limit: number, totalPages: number }}
 */
const getPaginationMeta = (total, page, limit) => {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export { getPaginationParams, getPaginationMeta };
