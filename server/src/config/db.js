'use strict';

/**
 * MongoDB Connection Configuration
 *
 * Connects to:
 *   - Development: Local MongoDB via MongoDB Compass (MONGO_URI=mongodb://localhost:27017/nsitm_dev)
 *   - Production:  MongoDB Atlas cluster (MONGO_URI=mongodb+srv://...)
 *
 * The same MONGO_URI environment variable is used in both environments.
 * The value is what changes between .env.development and .env.production.
 *
 * Mongoose 8 no longer requires most legacy connection options.
 * Connection event listeners are attached for disconnect recovery logging.
 */

import mongoose from 'mongoose';
import logger from '../utils/logger.js';

// Enable Mongoose's built-in query filter sanitization
mongoose.set('sanitizeFilter', true);

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error(
      'MONGO_URI is not defined in environment variables. ' +
      'Check your .env.development or .env.production file.'
    );
  }

  try {
    const conn = await mongoose.connect(mongoURI);

    const { host, name, port } = conn.connection;

    logger.info('MongoDB connection established', {
      host: process.env.NODE_ENV === 'development' ? host || 'localhost' : 'OKEYCHUKWU!!',
      database: process.env.NODE_ENV === 'development' ? name : 'Non of your business',
      port: port || 27017,
      environment: process.env.NODE_ENV,
    });

    // ── Connection event handlers ────────────────────────────────

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Mongoose will attempt to reconnect automatically.');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected successfully.');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error encountered', {
        message: err.message,
        code: err.code,
      });
    });

    // ── Graceful disconnect on process exit ──────────────────────
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed on application termination (SIGINT).');
    });

    process.on('SIGTERM', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed on application termination (SIGTERM).');
    });

    return conn;
  } catch (err) {
    logger.error('MongoDB initial connection failed', {
      message: err.message,
      uri: mongoURI.replace(/:\/\/.*@/, '://[CREDENTIALS_HIDDEN]@'), // Mask credentials in logs
    });
    throw err;
  }
};

export default connectDB;