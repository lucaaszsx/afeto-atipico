/**
 * @fileoverview Middleware responsible for sanitizing incoming inputs to prevent XSS attacks.
 * It recursively cleans strings in the request body, query, and parameters using sanitize-html.
 * Protects the application from malicious script injections across all input fields.
 * @author Lucas
 * @license MIT
 */

import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Request } from 'express';
import { isPlainObject, isString, isArray } from 'lodash';
import { Service } from 'typedi';
import sanitizeHtml from 'sanitize-html';

const sanitizeValue = (value: any): any => {
    if (isString(value)) {
        return sanitizeHtml(value, {
            allowedTags: [],
            allowedAttributes: {}
        });
    } else if (isArray(value)) {
        return value.map(sanitizeValue);
    } else if (isPlainObject(value)) {
        const sanitizedObj: any = {};
        for (const key in value) {
            sanitizedObj[key] = sanitizeValue(value[key]);
        }
        return sanitizedObj;
    }

    return value;
};

@Middleware({ type: 'before' })
@Service()
export default class XSSCleanMiddleware implements ExpressMiddlewareInterface {
    use(req: Request, _res: any, next: (err?: any) => any): void {
        for (const object of [req.body, req.query, req.params].filter(Boolean)) {
            for (const [key, value] of Object.entries(object)) {
                object[key] = sanitizeValue(value);
            }
        }

        next();
    }
}
