/**
 * @file NotFoundMiddleware.ts
 * @description Middleware that handles unmatched routes (404 errors).
 * It is registered after all controllers and only triggers if no route matched.
 * Must be used with `defaultErrorHandler: false` and after all other routing.
 *
 * @author Lucas
 * @license MIT
 */

import { Middleware, ExpressMiddlewareInterface } from 'routing-controllers';
import { Request, Response, NextFunction } from 'express';
import { NotFoundException } from '../responses';
import { Service } from 'typedi';

@Middleware({ type: 'after' })
@Service()
export default class NotFoundMiddleware implements ExpressMiddlewareInterface {
    use(req: Request, res: Response, next: NextFunction): void {
        if (!res.headersSent) throw new NotFoundException();

        next();
    }
}
