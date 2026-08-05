'use strict';

/**
 * Winston Application Logger
 *
 * DEVELOPMENT:
 *   — Outputs colorized, human-readable logs to the console.
 *   — Log level: debug (captures everything including verbose debug messages).
 *
 * PRODUCTION:
 *   — Outputs structured JSON to the console for CloudWatch/log aggregation.
 *   — Log level: info (suppresses debug/verbose logs).
 *   — Does NOT write to files to avoid serverless filesystem errors.
 *
 * Morgan HTTP logging is piped into this logger via the logger.http() method.
 */

import winston from 'winston';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const isProduction = process.env.NODE_ENV === 'production';
const isServerless = !!process.env.AWS_LAMBDA_FUNCTION_NAME || !!process.env.LAMBDA_TASK_ROOT;

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

// Add file transports in production ONLY if not running on AWS Lambda
if (isProduction && !isServerless) {
  // We dynamic import path and fs only if needed to save minimal memory overhead
  const path = await import('path');
  const fs = await import('fs');

  // const logsDir = path.join(process.cwd(), 'logs');

  // CHANGE: Use /tmp instead of process.cwd() for production
  const logsDir = '/tmp/logs';

  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: prodFormat,
      handleExceptions: true,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: prodFormat,
      maxsize: 20 * 1024 * 1024,
      maxFiles: 10,
    })
  );
}

// ── Create the logger instance ────────────────────────────────────────
const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  levels: {
    ...winston.config.npm.levels,
    http: 5,
  },
  transports,
  exitOnError: false,
  silent: process.env.NODE_ENV === 'test',
});

logger.http = (message) => logger.log('http', message);

export default logger;
