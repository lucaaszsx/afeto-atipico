/**
 * @file CompressionMiddleware.ts
 * @description Applies gzip compression to all HTTP responses, improving performance and reducing payload size. Integrated as a global middleware using `routing-controllers`, this middleware uses the standard `compression` package and is registered before the response is sent. Compression level and filters can be adjusted via options if needed.
 * @author Lucas
 * @license MIT
 * @created 2025-07-16
 */

import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Request, Response, NextFunction } from 'express';
import { EnvConfig } from '@/config/env';
import { Service } from 'typedi';
import compression from 'compression';

@Middleware({ type: 'before' })
@Service()
export default class CompressionMiddleware implements ExpressMiddlewareInterface {
    private compressionHandler: (req: Request, res: Response, next: NextFunction) => void;

    constructor() {
        this.compressionHandler = compression({
            level: EnvConfig.Compression.level,
            threshold: EnvConfig.Compression.threshold
        });
    }

    use(req: Request, res: Response, next: NextFunction): void {
        this.compressionHandler(req, res, next);
    }
}
