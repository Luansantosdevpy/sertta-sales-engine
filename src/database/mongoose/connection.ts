import mongoose from 'mongoose';
import { config } from '../../config';
import { logger } from '../../infra/logger/pino';

export const connectMongo = async (): Promise<void> => {
  mongoose.set('strictQuery', true);

  await mongoose.connect(config.database.mongoUri, {
    serverSelectionTimeoutMS: 8_000
  });

  logger.info('MongoDB connected');
};

export const disconnectMongo = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
};
