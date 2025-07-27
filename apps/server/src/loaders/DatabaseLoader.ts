/**
 * @file DatabaseLoader.ts
 * @description Loader responsible for establishing the MongoDB connection using Mongoose.
 * Integrates with the Microframework lifecycle to initialize the database on startup and close it gracefully on shutdown.
 * Includes structured logging for connection status and error handling for improved observability and resilience.
 * @author Lucas
 * @license MIT
 */

import { MicroframeworkSettings, MicroframeworkLoader } from 'microframework-w3tec';
import { EnvConfig } from '@/config/env';
import { Logger } from '@/lib/logger';
import mongoose from 'mongoose';

export const DatabaseLoader: MicroframeworkLoader = async (
    settings: MicroframeworkSettings
): Promise<void> => {
    const { username, password, host, params, dbName } = EnvConfig.Database;
    const logger: Logger = new Logger(__filename);

    try {
        await mongoose.connect(`mongodb+srv://${username}:${password}@${host}/${dbName}?${params}`);
        logger.info(`Connected to MongoDB at ${host}/${dbName}`);
    } catch (error) {
        logger.error('Failed to connect to MongoDB', error);
        process.exit(1);
    }

    settings.onShutdown(() => {
        mongoose.connection
            .close()
            .then(() => logger.info('MongoDB connection closed.'))
            .catch((err) => logger.error('Error closing MongoDB connection:', err));
    });
};
