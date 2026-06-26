'use strict';

/**
 * Winston Application Logger
 *
 * DEVELOPMENT:
 *   — Outputs colorized, human-readable logs to the console.
 *   — Log level: debug (captures everything including verbose debug messages).
 *
 * PRODUCTION:
 *   — Outputs structured JSON to both console and log files.
 *   — Log level: info (suppresses debug/verbose logs).
 *   — Creates a 'logs/' directory at project root if it does not exist.
 *   — error.log: errors only (level: error)
 *   — combined.log: all logs (level: info and above)
 *
 * Morgan HTTP logging is piped into this logger via the logger.http() method.
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const isProduction = process.env.NODE_ENV === 'production';

// ── Development log format: colorized, structured, readable ──────────
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    let output = `${ts} [${level}]: ${message}`;
    if (stack) output += `\n${stack}`;
    const metaKeys = Object.keys(meta);
    if (metaKeys.length > 0) {
      output += `\n  ${JSON.stringify(meta, null, 2)}`;
    }
    return output;
  })
);

// ── Production log format: structured JSON for log aggregation ────────
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

// ── Transports ────────────────────────────────────────────────────────
const transports = [
  new winston.transports.Console({
    format: isProduction ? prodFormat : devFormat,
    handleExceptions: true,
    handleRejections: true,
  }),
];

// Add file transports in production only
if (isProduction) {
  const logsDir = path.join(process.cwd(), 'logs');

  // Ensure the logs directory exists
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  transports.push(
    // Error-only log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: prodFormat,
      handleExceptions: true,
      maxsize: 10 * 1024 * 1024, // 10MB per file
      maxFiles: 5,               // Keep last 5 rotated files
    }),
    // All-levels combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: prodFormat,
      maxsize: 20 * 1024 * 1024, // 20MB per file
      maxFiles: 10,
    })
  );
}

// ── Create the logger instance ────────────────────────────────────────
const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  levels: {
    ...winston.config.npm.levels,
    http: 5, // Add custom 'http' level for Morgan integration (between verbose and debug)
  },
  transports,
  exitOnError: false,
  silent: process.env.NODE_ENV === 'test', // Silence all logs during automated tests
});

// ── Morgan integration helper ─────────────────────────────────────────
// Morgan is configured to stream its output here as HTTP-level log entries.
logger.http = (message) => logger.log('http', message);

export default logger;