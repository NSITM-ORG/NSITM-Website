'use strict';

/**
 * Environment Variable Validation
 *
 * Runs once at process startup, before the database connection or the
 * HTTP server are initialized. Fails fast with a clear, itemized error
 * message rather than letting the app boot into a broken state where
 * the first real request (e.g. a login attempt) mysteriously fails
 * with a cryptic JWT or Cloudinary error deep in the stack.
 *
 * SEVERITY LEVELS:
 *   REQUIRED_ALWAYS       — missing in dev OR prod = hard crash on boot
 *   REQUIRED_PRODUCTION   — only enforced when NODE_ENV === 'production'
 *                           (kept optional in development so a fresh
 *                           clone can run immediately without Cloudinary/
 *                           Resend accounts, per this project's local-dev
 *                           mock-mode design)
 *
 * Also enforces a minimum JWT_SECRET length, since a short/guessable
 * secret is a common real-world misconfiguration that passes a simple
 * "is it set?" check but is still insecure.
 */

import logger from '../utils/logger.js';

const REQUIRED_ALWAYS = [
  'NODE_ENV',
  'PORT',
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'JWT_REFRESH_SECRET',
  'JWT_REFRESH_EXPIRES_IN',
  'CLIENT_URL',
  'ADMIN_URL',
];

const REQUIRED_PRODUCTION_ONLY = [
  'RESEND_API_KEY',
  'EMAIL_FROM',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'SUPER_ADMIN_SETUP_KEY',
];

const MIN_SECRET_LENGTH = 32;

const validateEnv = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const missing = REQUIRED_ALWAYS.filter((key) => !process.env[key]);

  if (isProduction) {
    missing.push(...REQUIRED_PRODUCTION_ONLY.filter((key) => !process.env[key]));
  }

  if (missing.length > 0) {
    const message =
      `Missing required environment variable(s): ${missing.join(', ')}. ` +
      `Check your .env.${process.env.NODE_ENV || 'development'} file.`;
    throw new Error(message);
  }

  // ── Secret strength checks ──────────────────────────────────────────
  const weakSecrets = [];
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < MIN_SECRET_LENGTH) {
    weakSecrets.push('JWT_SECRET');
  }
  if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < MIN_SECRET_LENGTH) {
    weakSecrets.push('JWT_REFRESH_SECRET');
  }

  if (weakSecrets.length > 0) {
    const message =
      `The following secrets are shorter than the required ${MIN_SECRET_LENGTH} characters: ` +
      `${weakSecrets.join(', ')}. Generate a longer, random value for each ` +
      `(e.g. via 'node -e "console.log(require(\\'crypto\\').randomBytes(48).toString(\\'hex\\'))"').`;

    if (isProduction) {
      throw new Error(message);
    }
    // Warn only in development so local testing isn't blocked by this,
    // but the risk is still surfaced loudly.
    logger.warn(`⚠️  Weak secret detected (allowed in development only): ${message}`);
  }

  logger.info('Environment variable validation passed.', {
    environment: process.env.NODE_ENV,
  });
};

export default validateEnv;