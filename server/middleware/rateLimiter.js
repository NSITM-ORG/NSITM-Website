import rateLimit from 'express-rate-limit';
import chalk from 'chalk';

// General rate limiter for API routes
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit to 100 requests
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => process.env.NODE_ENV !== 'production', // Disable in development
  handler: (req, res) => {
    console.warn(chalk.yellow(`⚠ Rate limit exceeded for IP: ${req.ip}`));
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later',
    });
  },
});

// Stricter rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, please try again later',
  skip: (req) => process.env.NODE_ENV !== 'production',
  handler: (req, res) => {
    console.warn(chalk.yellow(`⚠ Auth rate limit exceeded for IP: ${req.ip}`));
    res.status(429).json({
      success: false,
      message: 'Too many login attempts, please try again later',
    });
  },
});

// File upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: 'Too many uploads, please try again later',
  skip: (req) => process.env.NODE_ENV !== 'production',
  handler: (req, res) => {
    console.warn(chalk.yellow(`⚠ Upload rate limit exceeded for IP: ${req.ip}`));
    res.status(429).json({
      success: false,
      message: 'Too many upload attempts, please try again later',
    });
  },
});

export { apiLimiter, authLimiter, uploadLimiter };
