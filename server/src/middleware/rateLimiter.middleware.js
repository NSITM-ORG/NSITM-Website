"use strict";

/**
 * Rate Limiting Middleware
 *
 * Provides distinct rate limiters for different endpoint categories.
 * All limits are per IP address.
 *
 * Configured limits (from FRD Q-10, Section 10.2, and FR-10.1 QA checklist):
 *
 *   loginLimiter          — 10 requests / 15 min  (admin login endpoint)
 *   enrollmentStep1Limiter — 5 requests / 10 min  (partial record creation — bot prevention)
 *   instalmentLinkLimiter  — 5 requests / 15 min  (/my-payment — prevents email flooding)
 *   generalApiLimiter      — 100 requests / 15 min (all other routes — catch-all)
 *
 * All limiters return the project's standard error response shape on 429:
 *   { status: "error", error: "RATE_LIMIT_EXCEEDED", message: "..." }
 *
 * Trust proxy is set in app.js so req.ip reflects the real client IP
 * even behind Railway's reverse proxy.
 */

import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { RATE_LIMITS, HTTP_STATUS } from "../config/constants.js";

// ─────────────────────────────────────────────────────────────────────
// SHARED: Standard 429 response handler
// Produces the project's standard error response shape for all limiters.
// ─────────────────────────────────────────────────────────────────────
const handler429 = (message) => (req, res) => {
  res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
    status: "error",
    error: "RATE_LIMIT_EXCEEDED",
    message,
  });
};

// ─────────────────────────────────────────────────────────────────────
// SHARED: Skip function for successful responses
// Only count requests that reach the server, not ones that fail
// ─────────────────────────────────────────────────────────────────────
const skipSuccessful = false; // Count all requests including successful ones

// ─────────────────────────────────────────────────────────────────────
// 1. Admin Login Rate Limiter
// Applied to: POST /api/v1/admin/auth/login
// Note: Account-level lockout (3 attempts) operates independently of this.
//       This prevents distributed brute force across different sessions.
// ─────────────────────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: RATE_LIMITS.LOGIN.WINDOW_MS,
  max: RATE_LIMITS.LOGIN.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler429(
    `Too many login attempts from this IP. Please wait ${RATE_LIMITS.LOGIN.WINDOW_MS / 60000} minutes before trying again.`,
  ),
  keyGenerator: (req) => ipKeyGenerator(req),
});

// ─────────────────────────────────────────────────────────────────────
// 2. Enrollment Step 1 Rate Limiter (Partial Record Creation)
// Applied to: POST /api/v1/public/enrollment/partial
// FRD Q-10: "Recommended: 5 requests per IP per 10 minutes on the
//           partial record creation endpoint."
// Prevents bots from flooding the Not Paid list with fake records.
// ─────────────────────────────────────────────────────────────────────
const enrollmentStep1Limiter = rateLimit({
  windowMs: RATE_LIMITS.ENROLLMENT_STEP1.WINDOW_MS,
  max: RATE_LIMITS.ENROLLMENT_STEP1.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler429(
    "Too many enrollment attempts from this IP. Please wait 10 minutes before trying again.",
  ),
  keyGenerator: (req) => ipKeyGenerator(req),
});

// ─────────────────────────────────────────────────────────────────────
// 3. Instalment Link Request Rate Limiter
// Applied to: POST /api/v1/public/my-payment (link request endpoint)
// FRD FR-10.1 QA: "Rate limiting: more than 5 requests from the same
//                IP in 15 minutes returns 429."
// Prevents email flooding via repeated link requests.
// ─────────────────────────────────────────────────────────────────────
const instalmentLinkLimiter = rateLimit({
  windowMs: RATE_LIMITS.INSTALMENT_LINK.WINDOW_MS,
  max: RATE_LIMITS.INSTALMENT_LINK.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler429(
    "Too many link requests from this IP. Please wait 15 minutes before trying again.",
  ),
  keyGenerator: (req) => ipKeyGenerator(req),
});

// ADD these two new limiters after instalmentLinkLimiter, before generalApiLimiter:

const superAdminRegisterLimiter = rateLimit({
  windowMs: RATE_LIMITS.SUPER_ADMIN_REGISTER.WINDOW_MS,
  max: RATE_LIMITS.SUPER_ADMIN_REGISTER.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler429(
    "Too many registration attempts from this IP. Please wait before trying again.",
  ),
  keyGenerator: (req) => ipKeyGenerator(req),
});

const adminRegistrationLimiter = rateLimit({
  windowMs: RATE_LIMITS.ADMIN_REGISTRATION.WINDOW_MS,
  max: RATE_LIMITS.ADMIN_REGISTRATION.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler429(
    "Too many attempts from this IP. Please wait 15 minutes before trying again.",
  ),
  keyGenerator: (req) => ipKeyGenerator(req),
});


const joinCommunityLimiter = rateLimit({
  windowMs: RATE_LIMITS.JOIN_COMMUNITY.WINDOW_MS,
  max: RATE_LIMITS.JOIN_COMMUNITY.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler429('Too many submissions from this IP. Please try again later.'),
  keyGenerator: (req) => ipKeyGenerator(req),
});


// ─────────────────────────────────────────────────────────────────────
// 4. General API Rate Limiter (Catch-All)
// Applied globally in app.js to all /api/v1/* routes.
// Provides baseline protection for all endpoints not covered above.
// ─────────────────────────────────────────────────────────────────────
const generalApiLimiter = rateLimit({
  windowMs: RATE_LIMITS.GENERAL_API.WINDOW_MS,
  max: RATE_LIMITS.GENERAL_API.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler429(
    "Too many requests from this IP. Please slow down and try again shortly.",
  ),
 keyGenerator: (req) => ipKeyGenerator(req),
  // Skip rate limiting for health check endpoint
  skip: (req) => req.path === "/health",
});

// FIND the module.exports and REPLACE with:

export {
 loginLimiter,
  enrollmentStep1Limiter,
  instalmentLinkLimiter,
  superAdminRegisterLimiter,
  adminRegistrationLimiter,
  joinCommunityLimiter,
  generalApiLimiter,
};
