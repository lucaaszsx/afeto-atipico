/**
 * @file CookieParserMiddleware.ts
 * @description Middleware for parsing cookies from HTTP requests. This middleware integrates the `cookie-parser` package as a global middleware using `routing-controllers`. It parses Cookie header and populates `req.cookies` with an object keyed by cookie names, enabling easy access to cookies throughout the application.
 * @author Lucas
 * @license MIT
 * @created 2025-07-23
 */

import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Request, Response, NextFunction } from 'express';
import { EnvConfig } from '@/config/env';
import { Service } from 'typedi';
import cookieParser from 'cookie-parser';

@Middleware({ type: 'before' })
@Service()
export default class CookieParserMiddleware implements ExpressMiddlewareInterface {
    private cookieParserHandler: (req: Request, res: Response, next: NextFunction) => void;

    constructor() {
        this.cookieParserHandler = cookieParser();
    }

    use(req: Request, res: Response, next: NextFunction): void {
        this.cookieParserHandler(req, res, next);
    }
}