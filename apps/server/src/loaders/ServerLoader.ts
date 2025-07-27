/**
 * @file ServerLoader.ts
 * @description Configures the Winston logger and loads it into the microframework context. Applies different formatting for development and production environments. Enhances error visibility and stack trace formatting for better debugging and observability. Executed during the application boot process as a MicroframeworkLoader component.
 * @author Lucas
 * @license MIT
 */

import {
    ErrorHandlerMiddleware,
    CookieParserMiddleware,
    SecurityHSTSMiddleware,
    CompressionMiddleware,
    URLEncodedMiddleware,
    RateLimitMiddleware,
    SecurityMiddleware,
    XSSCleanMiddleware,
    NotFoundMiddleware,
    LoggerMiddleware,
    CorsMiddleware
} from '@/api/middlewares';
import { authorizationChecker, currentUserChecker } from '@/auth';
import { MicroframeworkSettings, MicroframeworkLoader } from 'microframework-w3tec';
import { Application as ExpressApplication } from 'express';
import { createExpressServer } from 'routing-controllers';
import { EnvConfig } from '@/config/env';
import { Logger } from '@/lib/logger';
import { join } from 'node:path';

export const ServerLoader: MicroframeworkLoader = async (
    settings: MicroframeworkSettings
): Promise<void> => {
    const app: ExpressApplication = createExpressServer({
        routePrefix: EnvConfig.Application.routePrefix,
        defaultErrorHandler: false,
        classTransformer: true,
        validation: true,
        cors: false,
        controllers: [EnvConfig.Application.dirs.controllers],
        middlewares: [
            LoggerMiddleware,
            CorsMiddleware,
            RateLimitMiddleware,
            SecurityMiddleware,
            SecurityHSTSMiddleware,
            XSSCleanMiddleware,
            CookieParserMiddleware,
            CompressionMiddleware,
            URLEncodedMiddleware,
            NotFoundMiddleware,
            ErrorHandlerMiddleware
        ],
        authorizationChecker,
        currentUserChecker
    });

    // Configure trust proxy for proper IP detection when behind proxies (Vercel, nginx, load balancers)
    if (EnvConfig.Environment.node === 'prod') app.set('trust proxy', true);

    const logger: Logger = new Logger(__filename);
    const { port } = EnvConfig.Server;
    const server = app.listen(port, '0.0.0.0', () =>
        logger.info(`Server started on port ${port}.`)
    );

    settings.onShutdown(() => server.close());
    settings.setData('server', server);
    settings.setData('app', app);
};
