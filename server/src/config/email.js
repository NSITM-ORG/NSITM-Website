/**
 * Resend Email Client Configuration
 *
 * ENVIRONMENT BEHAVIOUR:
 *
 *   Development (no RESEND_API_KEY set):
 *     — Returns null. The email service will detect null and log emails
 *       to the console instead of sending them, allowing full local testing
 *       of all email-triggered flows without a Resend account.
 *
 *   Production (RESEND_API_KEY set):
 *     — Returns a fully initialized Resend client instance.
 *     — Throws at startup if RESEND_API_KEY is missing.
 *
 * This module exports a factory function getResendClient() rather than
 * a singleton client to support the null-in-development pattern cleanly.
 *
 * Actual email templates and sending logic live in src/services/email.service.js.
 */

import { Resend } from 'resend';
import logger from '../utils/logger.js';

let _resendClient = null;
let _initialized = false;

 const getResendClient = () => {
  // Return cached instance if already initialized
  if (_initialized) return _resendClient;

  const apiKey = process.env.RESEND_API_KEY;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!apiKey) {
    if (isProduction) {
      throw new Error(
        'RESEND_API_KEY is required in production mode. ' +
        'Add it to your .env.production file.'
      );
    }
    logger.warn(
      'Resend: RESEND_API_KEY not set. All emails will be logged to console in development mode. ' +
      'No emails will actually be delivered.'
    );
    _resendClient = null;
    _initialized = true;
    return null;
  }

  _resendClient = new Resend(apiKey);
  _initialized = true;

  logger.info('Resend email client initialized successfully', {
    fromAddress: process.env.EMAIL_FROM || 'not set',
  });

  return _resendClient;
};

export {
    getResendClient
}