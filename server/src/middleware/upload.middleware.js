'use strict';

/**
 * File Upload Middleware — Multer Configuration
 *
 * Uses memoryStorage so file data is held in a Buffer in memory.
 * This buffer is then either:
 *   - Streamed to Cloudinary (production, UPLOAD_ENABLED=true)
 *   - Replaced with a mock placeholder (development, UPLOAD_ENABLED=false)
 *
 * Both cases are handled in src/services/upload.service.js.
 * This middleware only handles the HTTP layer (parsing the multipart form
 * and validating file type + size before it reaches the controller).
 *
 * ACCEPTED FORMATS: JPG, JPEG, PNG, PDF
 * MAXIMUM SIZE: 5MB
 *
 * Error cases handled:
 *   - Wrong file type: 400 with message per FRD FR-02.4
 *   - File too large: 400 with message per FRD FR-02.4
 *   - No file when required: checked in the controller (not middleware)
 */

import multer from 'multer';
import path from 'path';
import ApiError from '../utils/ApiError.js';
import { UPLOAD, HTTP_STATUS }from '../config/constants.js';

// ─────────────────────────────────────────────────────────────────────
// STORAGE: Memory only — no disk writes
// Files are kept in req.file.buffer for upload.service.js to handle.
// ─────────────────────────────────────────────────────────────────────
const storage = multer.memoryStorage();

// ─────────────────────────────────────────────────────────────────────
// FILE FILTER: Accept only allowed MIME types
// ─────────────────────────────────────────────────────────────────────
const fileFilter = (req, file, callback) => {
  const isAllowedMime = UPLOAD.ALLOWED_MIME_TYPES.includes(file.mimetype);
  const ext = path.extname(file.originalname).toLowerCase();
  const isAllowedExt = UPLOAD.ALLOWED_EXTENSIONS.includes(ext);

  if (isAllowedMime && isAllowedExt) {
    return callback(null, true); // Accept the file
  }

  // Reject with the exact error message from FRD FR-02.4
  callback(
    new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'INVALID_FILE_TYPE',
      'Please upload a JPG, PNG, or PDF file.'
    )
  );
};

// ─────────────────────────────────────────────────────────────────────
// MULTER INSTANCE — base configuration
// ─────────────────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: UPLOAD.MAX_FILE_SIZE_BYTES, // 5MB — Multer throws LIMIT_FILE_SIZE if exceeded
    files: 1,                            // Only one file per request
  },
});

// ─────────────────────────────────────────────────────────────────────
// NAMED UPLOAD CONFIGURATIONS
// Each is a middleware that expects a specific field name.
// Using named configurations prevents field name mismatches.
// ─────────────────────────────────────────────────────────────────────

/**
 * uploadEnrollmentReceipt
 * Used on: POST /api/v1/public/enrollment/complete
 * Field name: 'receipt'
 * Handles: Initial enrollment receipt upload (Step 4 of the enrollment form)
 */
const uploadEnrollmentReceipt = (req, res, next) => {
  const multerSingle = upload.single('receipt');

  multerSingle(req, res, (err) => {
    if (!err) return next();

    // Translate Multer errors into ApiError instances for the error handler
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(
        new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          'FILE_TOO_LARGE',
          // Exact message from FRD FR-02.4
          'File exceeds 5MB. Please compress your image or upload a PDF.'
        )
      );
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(
        new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          'UNEXPECTED_FILE_FIELD',
          "Unexpected file field. Please use the 'receipt' field for file uploads."
        )
      );
    }
    // Pass through ApiError from fileFilter (wrong file type)
    return next(err);
  });
};

/**
 * uploadInstalmentReceipt
 * Used on: POST /api/v1/public/my-payment/submit
 * Field name: 'receipt'
 * Handles: Instalment payment receipt uploads (F-10)
 */
const uploadInstalmentReceipt = (req, res, next) => {
  const multerSingle = upload.single('receipt');

  multerSingle(req, res, (err) => {
    if (!err) return next();

    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(
        new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          'FILE_TOO_LARGE',
          'File exceeds 5MB. Please compress your image or upload a PDF.'
        )
      );
    }
    return next(err);
  });
};

/**
 * requireFile — Post-upload validation middleware.
 * Ensures a file was actually uploaded when one is required.
 * Attach AFTER uploadEnrollmentReceipt or uploadInstalmentReceipt.
 *
 * Usage:
 *   router.post('/complete', uploadEnrollmentReceipt, requireFile, controller);
 */
const requireFile = (req, res, next) => {
  if (!req.file) {
    return next(
      new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'FILE_REQUIRED',
        'A payment receipt file is required. Please upload a JPG, PNG, or PDF and try again.'
      )
    );
  }
  next();
};

export  {
  uploadEnrollmentReceipt,
  uploadInstalmentReceipt,
  requireFile,
};