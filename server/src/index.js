"use strict";

/**
 * NSITM Backend API — Server Entry Point
 *
 * Execution order on startup:
 * 1. Catch uncaught synchronous exceptions (must be first)
 * 2. Load environment variables from the correct .env file
 * 3. Import the Express application
 * 4. Connect to MongoDB
 * 5. Start the HTTP server
 * 6. Attach process-level event handlers for graceful shutdown
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
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(
    process.cwd(),
    `.env.${process.env.NODE_ENV || "development"}`,
  ),
});

// ── Step 2.5: Validate environment before anything else touches it ──
const validateEnv = require('./config/validateEnv');
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

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ── Step 4 & 5: Connect to DB then start server ────────────────────
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      logger.info("══════════════════════════════════════════════════");
      logger.info("   NSITM Backend API — Server Started");
      logger.info(`   Environment : ${NODE_ENV}`);
      logger.info(`   Port        : ${PORT}`);
      logger.info(`   Base URL    : http://localhost:${PORT}/api/v1`);
      logger.info("══════════════════════════════════════════════════");
    });

    // ── Step 6: Process-level event handlers ─────────────────────

    // Handle unhandled promise rejections gracefully
    process.on("unhandledRejection", (err) => {
      logger.error("[ UNHANDLED REJECTION ] Initiating graceful shutdown...", {
        name: err.name,
        message: err.message,
        stack: err.stack,
      });
      // Give the server time to finish in-flight requests
      server.close(() => {
        logger.info("Server closed. Exiting process.");
        process.exit(1);
      });
    });

    // Graceful shutdown on SIGTERM (used by Railway and other cloud platforms)
    process.on("SIGTERM", () => {
      logger.info(
        "[ SIGTERM ] Received shutdown signal. Closing server gracefully...",
      );
      server.close(() => {
        logger.info("All connections drained. Process terminated cleanly.");
        process.exit(0);
      });
    });

    // Graceful shutdown on SIGINT (Ctrl+C in development)
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
    process.exit(1);
  }
};

startServer();
