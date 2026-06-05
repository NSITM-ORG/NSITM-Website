import express from 'express';
import 'dotenv/config';
import 'dotenv-expand/config';
import chalk from 'chalk';
import connectDB from './config/database.js';
import { corsMiddleware } from './middleware/cors.js';
import { apiLimiter, authLimiter, uploadLimiter } from './middleware/rateLimiter.js';
import { errorHandler, asyncHandler } from './middleware/errorHandler.js';
import { configureCloudinary } from './config/cloudinary.js';
import { logger } from './utils/helpers.js';

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================================================
// INITIALIZE APP
// ============================================================================

const initializeApp = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Configure Cloudinary (optional - only if credentials provided)
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      // configureCloudinary();
    }

    logger.success('All configurations initialized successfully');
  } catch (error) {
    logger.error(`Initialization failed: ${error.message}`);
    process.exit(1);
  }
};

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Request parsing and security
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS middleware
app.use(corsMiddleware);

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/upload', uploadLimiter);

// Request logging middleware (development only)
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(chalk.cyan(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`));
    next();
  });
}

// Static files
app.use('/uploads', express.static('uploads'));

// ============================================================================
// ROUTES
// ============================================================================

// Health check route
app.get('/health', asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}));

// API info route
app.get('/api/info', asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'NSITM School System API',
    version: '1.0.0',
    environment: NODE_ENV,
  });
}));

// Route structure for future use
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/students', studentRoutes);
// app.use('/api/classes', classRoutes);
// app.use('/api/upload', uploadRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler - should be last before error handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.path} not found`,
  });
});

// Global error handler - must be last
app.use(errorHandler);

// ============================================================================
// SERVER STARTUP
// ============================================================================

const startServer = async () => {
  await initializeApp();

  app.listen(PORT, () => {
    console.log(chalk.magenta('═══════════════════════════════════════'));
    logger.success(`NSITM School System API Server`);
    logger.success(`Running in ${chalk.bold(NODE_ENV)} mode`);
    logger.success(`Server running on http://localhost:${PORT}`);
    logger.success(`API available at http://localhost:${PORT}/api`);
    logger.success(`Health check: http://localhost:${PORT}/health`);
    console.log(chalk.magenta('═══════════════════════════════════════'));
  });
};

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

process.on('SIGTERM', () => {
  logger.warning('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    logger.success('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.warning('SIGINT signal received: closing HTTP server');
  app.close(() => {
    logger.success('HTTP server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at ${promise}: ${reason}`);
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

// ============================================================================
// START APPLICATION
// ============================================================================

startServer();

export default app;

