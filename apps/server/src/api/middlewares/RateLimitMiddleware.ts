/**
 * @fileoverview Middleware responsible for applying rate limiting to incoming requests.
 * Integrates configuration from environment variables and uses express-rate-limit.
 * @author Lucas
 * @license MIT
 */

import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Request, Response, NextFunction } from 'express';
import { TooManyRequestsException } from '../responses';
import { EnvConfig } from '@/config/env';
import { Service } from 'typedi';
import rateLimit from 'express-rate-limit';

@Middleware({ type: 'before' })
@Service()
export default class RateLimitMiddleware implements ExpressMiddlewareInterface {
    private limiter = rateLimit({
        windowMs: EnvConfig.RateLimit.windowMs,
        max: EnvConfig.RateLimit.max,
        standardHeaders: true,
        legacyHeaders: false,

        handler: () => {
            throw new TooManyRequestsException();
        }
    });

    use(req: Request, res: Response, next: NextFunction): void {
        this.limiter(req, res, next);
    }
}
