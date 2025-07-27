/**
 * @file URLEncodedMiddleware.ts
 * @description Parses incoming request bodies with URL-encoded payloads (e.g., forms), making them available under `req.body`. Should be applied before any route handling or request validation logic. Uses Express’s built-in `urlencoded` parser internally. Typically applied to support HTML form submissions or similar data formats.
 * @author Lucas
 * @license MIT
 *
 */

import { Request, Response, NextFunction, urlencoded } from 'express';
import { Middleware } from 'routing-controllers';
import { Service } from 'typedi';

@Middleware({ type: 'before' })
@Service()
export class UrlEncodedMiddleware {
    private parser: (req: Request, res: Response, next: NextFunction) => void;

    constructor() {
        this.parser = urlencoded({
            extended: true, // Allows rich objects and arrays to be encoded
            limit: '100kb' // Prevents abuse with excessively large payloads
        });
    }

    use(req: Request, res: Response, next: NextFunction): void {
        this.parser(req, res, next);
    }
}
