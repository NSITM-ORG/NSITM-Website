'use strict';

/**
 * Token Generator Helper
 *
 * Generates cryptographically secure random tokens for:
 *   - Admin password reset links (24-hour expiry, single-use)
 *   - Instalment access links (30-minute expiry, single-use)
 *
 * SECURITY APPROACH:
 *   Raw tokens are generated using crypto.randomBytes() — cryptographically
 *   secure and impossible to predict.
 *   ONLY the SHA-256 hash of the raw token is stored in the database.
 *   The raw token is sent to the user (via email URL) and never stored.
 *   On validation, the received raw token is hashed and compared against
 *   the stored hash. Timing-safe comparison is used to prevent timing attacks.
 *
 * TEMPORARY PASSWORDS:
 *   Also generates random temporary passwords for new admin account creation.
 *   These use a character set that avoids ambiguous characters (0, O, l, I)
 *   for readability in emails.
 */

import crypto from 'crypto';
import { AUTH, INVITATION } from '../config/constants.js';

/**
 * Generate a cryptographically secure random token and its SHA-256 hash.
 *
 * @param {number} [byteLength=32] - Number of random bytes (hex string = 2x this)
 * @returns {{ rawToken: string, tokenHash: string }}
 *
 * Example output:
 *   rawToken: "a3f8c2e9b1d74f6a..." (64-char hex string)
 *   tokenHash: "7d4e9f2..." (64-char SHA-256 hex)
 */
const generateToken = (byteLength = 32) => {
  const rawToken = crypto.randomBytes(byteLength).toString('hex');
  const tokenHash = hashToken(rawToken);
  return { rawToken, tokenHash };
};

/**
 * Hash a raw token using SHA-256.
 * Used both when storing the token and when validating it.
 *
 * @param {string} rawToken - The raw token string received from the user
 * @returns {string} SHA-256 hex hash
 */
const hashToken = (rawToken) => {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
};

/**
 * Generate a unique JWT ID (jti claim) for token blocklist tracking.
 * Uses UUID v4 format (random).
 *
 * @returns {string} UUID v4 string
 */
const generateJti = () => {
  return crypto.randomUUID();
};

/**
 * Generate a temporary password for new admin account creation.
 * FRD FR-05.1: "Create Admin Account — Required inputs: name, email address, temporary password."
 *
 * Character set deliberately excludes ambiguous characters:
 *   Excluded: 0, O (zero vs letter O), l, I, 1 (el vs eye vs one)
 *   Included: uppercase, lowercase, numbers, common symbols
 *
 * @param {number} [length=12] - Minimum AUTH.TEMP_PASSWORD_LENGTH
 * @returns {string} Random temporary password meeting complexity requirements
 */
const generateTempPassword = (length = AUTH.TEMP_PASSWORD_LENGTH) => {
  // Ensure we have at least one of each required character class
  // to guarantee the password meets complexity requirements
  const upperChars   = 'ABCDEFGHJKMNPQRSTUVWXYZ';
  const lowerChars   = 'abcdefghjkmnpqrstuvwxyz';
  const numberChars  = '23456789';
  const specialChars = '!@#$%&*';
  const allChars     = upperChars + lowerChars + numberChars + specialChars;

  // Start with one guaranteed character from each required class
  const passwordChars = [
    upperChars[crypto.randomInt(upperChars.length)],
    lowerChars[crypto.randomInt(lowerChars.length)],
    numberChars[crypto.randomInt(numberChars.length)],
    specialChars[crypto.randomInt(specialChars.length)],
  ];

  // Fill remaining positions randomly
  for (let i = passwordChars.length; i < length; i++) {
    passwordChars.push(allChars[crypto.randomInt(allChars.length)]);
  }

  // Shuffle to prevent predictable character positions
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  return passwordChars.join('');
};

/**
 * Calculate the expiry Date object for a password reset token.
 * FRD FR-04.1.1: "24-hour expiry."
 *
 * @returns {Date} Date 24 hours from now
 */
const getPasswordResetExpiry = () => {
  return new Date(Date.now() + AUTH.PASSWORD_RESET_TOKEN_EXPIRY_MS);
};

/**
 * Calculate the expiry Date object for an instalment access token.
 * FRD F-10: "The token expires after 30 minutes."
 *
 * @returns {Date} Date 30 minutes from now
 */
const getInstalmentTokenExpiry = () => {
  return new Date(Date.now() + AUTH.INSTALMENT_TOKEN_EXPIRY_MS);
};

// ADD these new functions, then UPDATE the module.exports at the bottom.

/**
 * Generate a short verification code for admin invitations.
 * Uses an unambiguous uppercase alphanumeric alphabet (excludes 0/O/1/I/L).
 *
 * @param {number} [length=INVITATION.CODE_LENGTH]
 * @returns {{ rawCode: string, codeHash: string }}
 */
const generateShortCode = (length = INVITATION.CODE_LENGTH) => {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let rawCode = '';
  for (let i = 0; i < length; i++) {
    rawCode += alphabet[crypto.randomInt(alphabet.length)];
  }
  const codeHash = hashToken(rawCode);
  return { rawCode, codeHash };
};

/**
 * Generate meaningless random text for link obfuscation (point 5).
 * Generated and appended to URLs but never stored or validated.
 *
 * @param {number} [length=INVITATION.NOISE_TEXT_LENGTH]
 * @returns {string}
 */
const generateNoiseText = (length = INVITATION.NOISE_TEXT_LENGTH) => {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
};

/**
 * Calculate the expiry Date for an invitation's verification code.
 * FRD/instruction: 10-minute window.
 *
 * @returns {Date}
 */
const getInvitationCodeExpiry = () => {
  // const { INVITATION } = require('../config/constants');
  return new Date(Date.now() + INVITATION.CODE_EXPIRY_MS);
};

/**
 * Timing-safe comparison of two strings (e.g. setup keys, codes).
 * Hashes both sides first so length differences don't leak information,
 * then uses crypto.timingSafeEqual on equal-length buffers.
 *
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
const secureCompare = (a = '', b = '') => {
  const hashA = crypto.createHash('sha256').update(String(a)).digest();
  const hashB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
};
// FIND the existing module.exports and REPLACE with:

export {
  generateToken,
  hashToken,
  generateJti,
  generateTempPassword,
  getPasswordResetExpiry,
  getInstalmentTokenExpiry,
  generateShortCode,
  generateNoiseText,
  getInvitationCodeExpiry,
  secureCompare,
};