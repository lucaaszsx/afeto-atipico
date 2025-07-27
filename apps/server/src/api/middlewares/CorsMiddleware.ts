/**
 * @file CorsMiddleware.ts
 * @description Enables Cross-Origin Resource Sharing (CORS) for incoming HTTP requests.
 * Configures response headers to allow specific origins, methods, and headers.
 * Should be applied before any route handling to ensure proper preflight response handling.
 * Useful for frontend-backend integrations or public APIs.
 *
 * @author Lucas
 * @license MIT
 */

import { Request, Response, NextFunction } from 'express';
import { Middleware } from 'routing-controllers';
import cors, { CorsOptions } from 'cors';
import { EnvConfig } from '@/config/env';
import { Service } from 'typedi';

@Middleware({ type: 'before' })
@Service()
export default class CorsMiddleware {
    private handler: (req: Request, res: Response, next: NextFunction) => void;

    constructor() {
        const options: CorsOptions = {
            origin: (origin, callback) => {
                const allowedOrigins = EnvConfig.Cors.origins;

                if (!origin || allowedOrigins.includes(origin)) callback(null, true);
                else callback(null, false);
            },
            methods: EnvConfig.Cors.methods,
            allowedHeaders: EnvConfig.Cors.allowedHeaders,
            credentials: EnvConfig.Cors.credentials
        };

        this.handler = cors(options);
    }

    use(req: Request, res: Response, next: NextFunction): void {
        this.handler(req, res, next);
    }
}
