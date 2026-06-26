/**
 * Cloudinary Configuration
 * 
 * ENVIRONMENT BEHAVIOUR:
 * 
 * UPLOAD_ENABLED=false (development / local):
 * — Cloudinary is NOT configured and NOT used.
 * — File uploads produce a mock placeholder object stored on the record.
 * — The entire system functions fully for local testing without any Cloudinary account.
 * 
 * UPLOAD_ENABLED=true (production):
 * — Cloudinary is fully configured using environment credentials.
 * — All receipt uploads are streamed to Cloudinary.
 * — Files are organized under nsitm/ folder hierarchy.
 * — Throws at startup if any Cloudinary env variable is missing.
 * 
 * This module is imported by src/services/upload.service.js.
 * It is never called directly from controllers.
 */

import { v2 as cloudinary } from 'cloudinary';
import logger from '../utils/logger.js';

const UPLOAD_ENABLED = process.env.UPLOAD_ENABLED === 'true';

if (UPLOAD_ENABLED) {
  const {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
  } = process.env;

  const missingVars = [];
  if (!CLOUDINARY_CLOUD_NAME) missingVars.push('CLOUDINARY_CLOUD_NAME');
  if (!CLOUDINARY_API_KEY) missingVars.push('CLOUDINARY_API_KEY');
  if (!CLOUDINARY_API_SECRET) missingVars.push('CLOUDINARY_API_SECRET');

  if (missingVars.length > 0) {
    throw new Error(
      `Cloudinary configuration error: Missing required environment variables: ${missingVars.join(', ')}. ` +
      `Set UPLOAD_ENABLED=false for local development.`
    );
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true, // Always use HTTPS for Cloudinary URLs
  });

  logger.info('Cloudinary configured and ready', {
    cloudName: CLOUDINARY_CLOUD_NAME,
    uploadEnabled: true,
  });
} else {
  logger.info('Cloudinary: Upload is DISABLED. File handling is in mock/local mode.', {
    uploadEnabled: false,
    note: 'Set UPLOAD_ENABLED=true in production to enable real file uploads.',
  });
}

export default cloudinary;
