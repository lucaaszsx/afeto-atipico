/**
 * @file BaseException.ts
 * @description Base exception class for all API response errors.
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../ApiCodes';

export class BaseException extends Error {
    public readonly apiCode: ApiErrorCodes;

    constructor(apiCode: number, details: string[] = []) {
        super(`E${apiCode}`);

        this.apiCode = apiCode;
        this.details = details;
        this.name = this.constructor.name;

        Object.setPrototypeOf(this, BaseException.prototype);
    }
}
