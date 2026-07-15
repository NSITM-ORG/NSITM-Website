'use strict';

/**
 * NSITM Backend API — Express Application Configuration
 *
 * This file configures and exports the Express application instance.
 * It is intentionally separated from src/index.js so the app can be
 * imported independently for testing without starting the HTTP server.
 *
 * Middleware registration order is deliberate:
 * 1. Security headers (Helmet)
 * 2. CORS
 * 3. Body parsers
 * 4. Cookie parser
 * 5. Compression
 * 6. HTTP request logging (Morgan)
 * 7. Data sanitization (NoSQL injection, HPP)
 * 8. Health check (unauthenticated)
 * 9. API routes
 * 10. 404 handler (catches all unmatched routes)
 * 11. Global error handler (must be last)
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
// import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';


import logger from './utils/logger.js';
import ApiError from './utils/ApiError.js';
import errorHandler from './middleware/errorHandler.middleware.js';
import routes from './routes/index.js';

const app = express();

// ─────────────────────────────────────────────────────────────────────
// TRUST PROXY
// Required for accurate IP detection behind Railway / Vercel proxies.
// ─────────────────────────────────────────────────────────────────────
app.set('trust proxy', 1);

// ─────────────────────────────────────────────────────────────────────
// 1. SECURITY HEADERS — Helmet
// ─────────────────────────────────────────────────────────────────────
app.use(
  helmet({
    // Disable COEP to allow embedding of external content (e.g., Cloudinary images)
    crossOriginEmbedderPolicy: false,
    // Enable CSP only in production
    contentSecurityPolicy:
      process.env.NODE_ENV === 'production'
        ? undefined  // Use Helmet's strict production defaults
        : false,     // Disable in development for easier debugging
  })
);

// ─────────────────────────────────────────────────────────────────────
// 2. CORS
// Restricts which origins can make requests to this API.
// Development: permissive (allows all origins for local tooling).
// Production: strictly enforces CLIENT_URL and ADMIN_URL.
// ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
].filter(Boolean); // Filter out undefined values

app.use(
  cors({
    // origin: true,           // Reflects the actual request origin
    origin: (origin, callback) => {
      // Allow requests with no origin header (Postman, curl, server-to-server, mobile apps)
      if (!origin) return callback(null, true);

      // Always allow configured origins
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // In development, allow any origin for ease of testing
      if (process.env.NODE_ENV === 'development') return callback(null, true);

      // Block all other origins in production
      callback(new Error(`CORS: Origin '${origin}' is not permitted.`));
    },
    credentials: true, // Allow cookies and Authorization headers
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
    ],
    exposedHeaders: ['Content-Disposition'], // Needed for CSV download headers
  })
);

// ─────────────────────────────────────────────────────────────────────
// 3 & 4. BODY PARSERS & COOKIE PARSER
// JSON body is limited to 10kb to prevent large payload attacks.
// File uploads are handled separately by Multer middleware (not here).
// ─────────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ─────────────────────────────────────────────────────────────────────
// 5. COMPRESSION
// Compresses all HTTP responses to reduce bandwidth usage.
// Particularly important for Nigerian mobile connections (3G/4G).
// ─────────────────────────────────────────────────────────────────────
app.use(compression());

// ─────────────────────────────────────────────────────────────────────
// 6. HTTP REQUEST LOGGING — Morgan
// Development: concise colorized output to console.
// Production: structured 'combined' format streamed into Winston.
// ─────────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: {
        write: (message) => logger.http(message.trim()),
      },
      // Skip logging for health check endpoint to reduce noise
      skip: (req) => req.url === '/health',
    })
  );
}

// ─────────────────────────────────────────────────────────────────────
// 7. DATA SANITIZATION
// ─────────────────────────────────────────────────────────────────────

// Prevent MongoDB NoSQL injection attacks.
// Strips characters like '$' and '.' from req.body, req.query, req.params.
// app.use(
//   mongoSanitize({
//     replaceWith: '_',
//     onSanitize: ({ req, key }) => {
//       logger.warn('Potential NoSQL injection attempt intercepted', {
//         ip: req.ip,
//         method: req.method,
//         url: req.originalUrl,
//         sanitizedKey: key,
//       });
//     },
//   })
// );

// Prevent HTTP Parameter Pollution attacks.
// E.g., prevents ?status=confirmed&status=not_paid breaking query logic.
app.use(hpp());

// ─────────────────────────────────────────────────────────────────────
// 8. HEALTH CHECK ENDPOINT
// Public, unauthenticated. Used by Railway and monitoring tools.
// ─────────────────────────────────────────────────────────────────────
import { attachAuditLogger }from './middleware/auditLog.middleware.js';
app.use(attachAuditLogger);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      service: 'NSITM Backend API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(process.uptime())}s`,
    },
    message: 'Service is healthy and running.',
  });
});

// ─────────────────────────────────────────────────────────────────────
// 9. API ROUTES
// All routes are versioned under /api/v1.
// See src/routes/index.js for full route registration.
// ─────────────────────────────────────────────────────────────────────
import { generalApiLimiter } from './middleware/rateLimiter.middleware.js';
app.use('/api/v1', generalApiLimiter);

app.use('/api/v1', routes);

// ─────────────────────────────────────────────────────────────────────
// 10. 404 HANDLER
// Catches all requests that did not match any defined route.
// MUST come after all route registrations.
// ─────────────────────────────────────────────────────────────────────
app.all('/{*splat}', (req, res, next) => {
  next(
    new ApiError(
      404,
      'ROUTE_NOT_FOUND',
      `The route '${req.method} ${req.originalUrl}' does not exist on this server. Please check the API documentation.`
    )
  );
});

// ─────────────────────────────────────────────────────────────────────
// 11. GLOBAL ERROR HANDLER
// MUST be the LAST middleware registered.
// Handles all errors passed to next(err) from anywhere in the stack.
// ─────────────────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;