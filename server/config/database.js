import mongoose from 'mongoose';
import chalk from 'chalk';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(chalk.green(`✓ MongoDB Connected: ${conn.connection.host}`));
    return conn;
  } catch (error) {
    console.error(chalk.red(`✗ MongoDB Connection Error: ${error.message}`));
    process.exit(1);
  }
};

export default connectDB;
