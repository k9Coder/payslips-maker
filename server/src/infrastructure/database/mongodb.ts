import mongoose from 'mongoose';
import { env } from '../env';
import { logger } from '../logger/logger';

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info('MongoDB connected', { uri: env.MONGODB_URI.split('@').pop() });
  } catch (error) {
    logger.error('MongoDB connection failed', { error: String(error) });
    process.exit(1);
  }
}
