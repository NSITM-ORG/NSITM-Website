'use strict';

/**
 * Upload Service — Receipt File Handling
 *
 * Abstracts the difference between development (mock) and production (Cloudinary)
 * file upload behavior behind a single interface.
 *
 * DEVELOPMENT (UPLOAD_ENABLED=false):
 *   Returns the UPLOAD.MOCK_PLACEHOLDER object immediately.
 *   No network call. No Cloudinary account needed.
 *   The entire enrollment flow, admin review, and instalment submission
 *   work normally — the receipt "URL" is just the placeholder string.
 *
 * PRODUCTION (UPLOAD_ENABLED=true):
 *   Streams the file buffer from Multer's memoryStorage to Cloudinary
 *   using the upload_stream API + streamifier.
 *   Returns { url, publicId, provider: 'cloudinary' }.
 *   Files are stored under the configured folder path and are NOT
 *   publicly accessible by direct URL (Cloudinary access control).
 *
 * CALLED BY:
 *   - enrollment.controller.js → completeEnrollment (Step 4)
 *   - instalment.controller.js → submitInstalmentReceipt
 */

import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary.js';
import { UPLOAD, CLOUDINARY_FOLDERS } from '../config/constants.js';
import logger from '../utils/logger.js';

const UPLOAD_ENABLED = () => process.env.UPLOAD_ENABLED === 'true';

/**
 * Upload a file buffer to Cloudinary via stream.
 * Internal function — not exported directly.
 *
 * @param {Buffer} buffer - The file buffer from req.file.buffer
 * @param {Object} options - Cloudinary upload options
 * @returns {Promise<Object>} Cloudinary upload result
 */
const streamUpload = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Upload an enrollment receipt file.
 * Used in Step 4 of the enrollment form (initial payment receipt).
 *
 * @param {Object} file - req.file from Multer (memoryStorage)
 * @param {Buffer} file.buffer - Raw file data
 * @param {string} file.originalname - Original filename (for logging)
 * @param {string} file.mimetype - MIME type (for Cloudinary resource_type)
 * @returns {Promise<{ url: string, publicId: string|null, provider: string, uploadedAt: Date }>}
 */
const uploadEnrollmentReceipt = async (file) => {
  if (!UPLOAD_ENABLED()) {
    logger.debug('Upload skipped (UPLOAD_ENABLED=false). Mock placeholder returned.', {
      originalname: file.originalname,
    });
    return {
      ...UPLOAD.MOCK_PLACEHOLDER,
      uploadedAt: new Date(),
    };
  }

  try {
    const result = await streamUpload(file.buffer, {
      folder: CLOUDINARY_FOLDERS.ENROLLMENT_RECEIPTS,
      resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'image',
      // Use a unique public_id to prevent overwriting
      public_id: `receipt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      // Restrict access — files are not publicly accessible.
      // IMPORTANT: because type/access_mode are 'authenticated', the
      // secure_url below is NOT directly viewable. Callers MUST use
      // getSignedFileUrl(publicId, resourceType) to produce a viewable
      // link at display time — see enrollment.controller.js.
      type: 'authenticated',
      access_mode: 'authenticated',
    });

    logger.info('Enrollment receipt uploaded to Cloudinary', {
      publicId: result.public_id,
      bytes: result.bytes,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      provider: 'cloudinary',
      uploadedAt: new Date(),
    };
  } catch (err) {
    logger.error('Cloudinary upload failed for enrollment receipt', {
      error: err.message,
      originalname: file.originalname,
    });
    throw err; // Re-throw so the controller can handle and show the student an error
  }
};

/**
 * Upload an instalment payment receipt file.
 * Used in the instalment receipt submission flow (F-10).
 *
 * @param {Object} file - req.file from Multer
 * @returns {Promise<{ url: string, publicId: string|null, provider: string, uploadedAt: Date }>}
 */
const uploadInstalmentReceipt = async (file) => {
  if (!UPLOAD_ENABLED()) {
    logger.debug('Instalment upload skipped (UPLOAD_ENABLED=false). Mock placeholder returned.', {
      originalname: file.originalname,
    });
    return {
      ...UPLOAD.MOCK_PLACEHOLDER,
      uploadedAt: new Date(),
    };
  }

  try {
    const result = await streamUpload(file.buffer, {
      folder: CLOUDINARY_FOLDERS.INSTALMENT_RECEIPTS,
      resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'image',
      public_id: `instalment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      // Restrict access — files are not publicly accessible.
      // IMPORTANT: because type/access_mode are 'authenticated', the
      // secure_url below is NOT directly viewable. Callers MUST use
      // getSignedFileUrl(publicId, resourceType) to produce a viewable
      // link at display time — see enrollment.controller.js.
      type: 'authenticated',
      access_mode: 'authenticated',
    });

    logger.info('Instalment receipt uploaded to Cloudinary', {
      publicId: result.public_id,
      bytes: result.bytes,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      provider: 'cloudinary',
      uploadedAt: new Date(),
    };
  } catch (err) {
    logger.error('Cloudinary upload failed for instalment receipt', {
      error: err.message,
    });
    throw err;
  }
};


/**
 * Generate a fresh, time-limited signed URL for an authenticated Cloudinary
 * resource.
 *
 * WHY THIS EXISTS:
 *   Receipts are uploaded with `type: 'authenticated'` so they are never
 *   publicly reachable by direct URL (per FRD: "not publicly accessible
 *   by direct URL"). Cloudinary requires a cryptographic signature to
 *   serve an authenticated resource — the bare secure_url returned at
 *   upload time is NOT sufficient on its own and will return Access
 *   Denied if requested without one.
 *
 *   Rather than generating and permanently storing a signed URL (which
 *   would either need to never expire — a security smell — or would go
 *   stale and break), this function generates a SHORT-LIVED signed URL
 *   ON DEMAND, every time an admin actually opens a record. This is the
 *   Cloudinary-recommended pattern for authenticated delivery.
 *
 * @param {string} publicId - The Cloudinary public_id stored on the record
 * @param {'image'|'raw'} [resourceType='image'] - 'raw' for PDF receipts
 * @param {number} [expiresInSeconds=3600] - Signed URL validity window (1 hour default)
 * @returns {string|null} Signed URL, or null if publicId is missing/local-mode
 */
const getSignedFileUrl = (publicId, resourceType = 'image', expiresInSeconds = 3600) => {
  if (!UPLOAD_ENABLED() || !publicId || publicId === null) {
    return null; // Local/dev mode — nothing to sign
  }

  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

  return cloudinary.url(publicId, {
    type: 'authenticated',
    resource_type: resourceType,
    sign_url: true,
    expires_at: expiresAt,
  });
};

/**
 * Delete a file from Cloudinary by its public_id.
 * Called when a student record is hard-deleted by Super Admin.
 * FRD Section 6.3 data retention: "If a record is deleted by Super Admin,
 * the associated Cloudinary file must also be deleted."
 *
 * @param {string} publicId - The Cloudinary public_id to delete
 * @param {string} [resourceType='image'] - 'image' or 'raw' (for PDFs)
 * @returns {Promise<void>}
 */
const deleteFile = async (publicId, resourceType = 'image') => {
  if (!UPLOAD_ENABLED() || !publicId || publicId === 'local_upload_skipped') {
    return; // Nothing to delete in dev mode or if no real file was stored
  }

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    logger.info('Cloudinary file deleted', { publicId });
  } catch (err) {
    // Log but don't throw — deletion failures shouldn't block record deletion
    logger.error('Failed to delete Cloudinary file', {
      publicId,
      error: err.message,
    });
  }
};

export {
  uploadEnrollmentReceipt,
  uploadInstalmentReceipt,
  getSignedFileUrl,
  deleteFile,
};