/**
 * @file TooManyRequests.ts
 * @description Custom exception class used to indicate that the client has made too many requests.
 * Extends the BaseException to provide consistent error structure across the application.
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../ApiCodes';
import { BaseException } from '../Base';

export class TooManyRequestsException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.TOO_MANY_REQUESTS, details);
    }
}
