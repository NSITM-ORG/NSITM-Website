'use strict';

/**
 * NSITM Backend API — Server Entry Point
 *
 * Universal entry point that works across all environments:
 * - Development: Runs as traditional Express server with hot reload
 * - Vercel: Exports serverless handler for production test
 * - Webdock: Runs as traditional Express server for final production
 * - React: Serves as REST API backend for React frontend
 *
 * Execution order on startup:
 * 1. Catch uncaught synchronous exceptions (must be first)
 * 2. Load environment variables from the correct .env file
 * 3. Determine environment and export/start accordingly
 * 4. Connect to MongoDB (once for server, per-request for serverless)
 * 5. Start HTTP server or export handler
 */

// ── Step 1: Catch uncaught exceptions BEFORE anything else loads ────
process.on("uncaughtException", (err) => {
  console.error("[ UNCAUGHT EXCEPTION ] Shutting down immediately...");
  console.error(`Name: ${err.name}`);
  console.error(`Message: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

// ── Step 2: Load environment variables ─────────────────────────────
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({
  path: path.resolve(process.cwd(), envFile)
});

// Also load .env as fallback
dotenv.config();

// ── Step 2.5: Validate environment before anything else touches it ──
import validateEnv from './config/validateEnv.js';
try {
  validateEnv();
} catch (err) {
  console.error(`\n❌ Environment validation failed: ${err.message}\n`);
  process.exit(1);
}

// ── Step 3: Import app and dependencies ────────────────────────────
import app from "./app.js";
import connectDB from "./config/db.js";
import logger from "./utils/logger.js";
import chalk from 'chalk';

// ── Determine Environment ────────────────────────────────────────────
const isVercel = !!process.env.VERCEL;
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

const PORT = process.env.PORT || 5000;

// ── Serverless (Vercel) state ───────────────────────────────────────
let dbConnected = false;
let dbConnectionPromise = null;

/**
 * Serverless handler for Vercel
 * Connects to MongoDB on first request and reuses connection
 */
async function handler(req, res) {
  // Enable CORS for React frontend
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Connect to MongoDB if not already connected
    if (!dbConnected) {
      if (!dbConnectionPromise) {
        dbConnectionPromise = connectDB()
          .then(() => {
            dbConnected = true;
            logger.info('✅ MongoDB connected successfully in Vercel environment');
          })
          .catch((err) => {
            dbConnectionPromise = null;
            throw err;
          });
      }
      await dbConnectionPromise;
    }

    // Let Express handle the request
    return app(req, res);
  } catch (err) {
    logger.error('❌ Serverless handler error:', {
      message: err.message,
      stack: err.stack
    });

    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

// ── Top-level exports (required for ESM + Vercel) ───────────────────
export default handler;
export { handler };

// ── Traditional Server (Development & Webdock Production) ───────────
// Only start the HTTP server when NOT running on Vercel
if (!isVercel) {
  console.log('🔄 Running in traditional server mode');

  const startServer = async () => {
    try {
      // Log environment details
      console.log(chalk.blue('══════════════════════════════════════════════════'));
      console.log(chalk.green('   🚀 NSITM Backend API — Starting Server'));
      console.log(chalk.cyan(`   Environment : ${process.env.NODE_ENV || 'development'}`));
      console.log(chalk.cyan(`   Port        : ${PORT}`));
      console.log(chalk.cyan(`   Mode        : Traditional`));
      console.log(chalk.blue('══════════════════════════════════════════════════'));

      await connectDB();

      const server = app.listen(PORT, () => {
        logger.info("══════════════════════════════════════════════════");
        logger.info("   ✅ NSITM Backend API — Server Started");
        logger.info(`   Environment : ${process.env.NODE_ENV || 'development'}`);
        logger.info(`   Port        : ${PORT}`);
        logger.info(`   Base URL    : http://localhost:${PORT}/api/v1`);
        logger.info(`   Client URL  : ${process.env.CLIENT_URL || 'Not configured'}`);
        logger.info("══════════════════════════════════════════════════");

        console.log(chalk.green('\n✅ Server is running!'));
        console.log(chalk.cyan(`📍 Local:    http://localhost:${PORT}`));
        console.log(chalk.cyan(`📡 API:      http://localhost:${PORT}/api/v1`));
        console.log(chalk.cyan(`❤️  Health:   http://localhost:${PORT}/health`));
        if (process.env.CLIENT_URL) {
          console.log(chalk.cyan(`🌐 Client:   ${process.env.CLIENT_URL}`));
        }
        console.log(chalk.gray('\nPress Ctrl+C to stop\n'));
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          logger.error(`❌ Port ${PORT} is already in use by another process.`);
          logger.error('   Change PORT in your .env file or kill the other process.');
          process.exit(1);
        } else {
          logger.error('Server error:', err);
          process.exit(1);
        }
      });

      // Request logging middleware (development only)
      if (isDevelopment) {
        app.use((req, res, next) => {
          console.log(
            chalk.gray(`[${new Date().toLocaleTimeString()}]`),
            chalk.cyan(`${req.method}`),
            chalk.white(`${req.path}`)
          );
          next();
        });
      }

      // Process-level event handlers
      process.on("unhandledRejection", (err) => {
        logger.error("[ UNHANDLED REJECTION ] Initiating graceful shutdown...", {
          name: err.name,
          message: err.message,
          stack: err.stack,
        });
        server.close(() => {
          logger.info("Server closed. Exiting process.");
          process.exit(1);
        });
      });

      process.on("SIGTERM", () => {
        logger.info("[ SIGTERM ] Received shutdown signal. Closing server gracefully...");
        server.close(() => {
          logger.info("All connections drained. Process terminated cleanly.");
          process.exit(0);
        });
      });

      process.on("SIGINT", () => {
        logger.info("[ SIGINT ] Interrupt received. Shutting down...");
        server.close(() => {
          logger.info("Server closed on interrupt.");
          process.exit(0);
        });
      });

      return server;
    } catch (err) {
      logger.error("Failed to start server:", {
        message: err.message,
        stack: err.stack,
      });
      console.error(chalk.red('\n❌ Failed to start server:'), err.message);
      process.exit(1);
    }
  };

  startServer();
} else {
  console.log('🔄 Running in Vercel serverless mode');
}