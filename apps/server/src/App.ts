/**
 * @file App.ts
 * @description Application entry point, responsible for initializing loaders.
 * @author Lucas
 * @license MIT
 */
import { addAlias } from 'module-alias';

// Configure module alias based on environment
if (process.env.NODE_ENV !== 'prod') {
    addAlias('@', __dirname.replace('dist', 'src'));
}

import 'module-alias/register';
import 'reflect-metadata';
import {
    EventDispatcherLoader,
    WebSocketLoader,
    DatabaseLoader,
    LoggerLoader,
    ServerLoader,
    IoCLoader
} from './loaders';
import { bootstrapMicroframework } from 'microframework-w3tec';
import { Logger } from './lib/logger';

const logger = new Logger(__filename);

bootstrapMicroframework({
    loaders: [LoggerLoader, IoCLoader, EventDispatcherLoader, DatabaseLoader, ServerLoader, WebSocketLoader]
})
    .then(() => {
        logger.info('Application initialized successfully!');
    })
    .catch((err) => {
        logger.error('An error occurred during application initialization:\n', err.stack);
    });
