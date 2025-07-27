/**
 * @file AccessTokenExpired.ts
 * @description Custom exception class used to indicate expired access token.
 * Extends the BaseException to provide consistent error structure across the application.
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../../ApiCodes';
import { BaseException } from '../../Base';

export class AccessTokenExpiredException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.ACCESS_TOKEN_EXPIRED, details);
    }
}
