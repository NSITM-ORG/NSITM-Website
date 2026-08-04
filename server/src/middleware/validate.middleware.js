'use strict';

/**
 * Validation Middleware — express-validator Result Handler
 *
 * Works with validator chains defined in src/utils/validators/*.validator.js.
 * Those files export arrays of express-validator check() calls.
 * This middleware reads their results and short-circuits the request
 * with a structured 422 error response if any check failed.
 *
 * Usage in a route:
 *   const { enrollmentStep1Validator } = require('../utils/validators/enrollment.validator');
 *   const { validate } = require('../middleware/validate.middleware');
 *
 *   router.post('/partial', enrollmentStep1Validator, validate, controller);
 *
 * Error response shape (standard project format):
 *   {
 *     "status": "error",
 *     "error": "VALIDATION_ERROR",
 *     "message": "Full Name is required. Phone number must be a valid Nigerian mobile number."
 *   }
 *
 * Multiple field errors are joined into a single message string for consistency
 * with the project's single-message error response contract.
 * The `details` array gives the frontend enough information to highlight
 * specific fields with inline error states.
 */

import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * validate — Reads express-validator results and responds with 422 if any failed.
 *
 * Always attach this AFTER your validator chain and BEFORE the controller.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next(); // All checks passed — proceed to controller
  }

  const extractedErrors = errors.array();

  // Build human-readable combined message
  const combinedMessage = extractedErrors
    .map((err) => err.msg)
    .join(' ');

  // Build structured details array for frontend field-level error handling
  const details = extractedErrors.map((err) => ({
    field: err.path || err.param,
    message: err.msg,
    value: err.value !== undefined ? String(err.value) : undefined,
  }));

  return next(
    Object.assign(
      new ApiError(
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        'VALIDATION_ERROR',
        combinedMessage
      ),
      { details } // Attach details to the error for the error handler to include
    )
  );
};

export { validate };