/**
 * @file App.ts
 * @description Application entry point, responsible for initializing loaders.
 * @author Lucas
 * @license MIT
 */

import 'reflect-metadata';
import { DatabaseLoader, LoggerLoader, ServerLoader, IoCLoader } from './loaders';
import { bootstrapMicroframework } from 'microframework-w3tec';
import { Logger } from './lib/logger';

const logger = new Logger(__filename);

bootstrapMicroframework({
    loaders: [LoggerLoader, IoCLoader, DatabaseLoader, ServerLoader]
})
    .then(() => {
        logger.info('Application initialized successfully!');
    })
    .catch((err) => {
        logger.error('An error occurred during application initialization:\n', err.stack);
    });