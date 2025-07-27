/**
 * @file RefreshTokenExpired.ts
 * @description Custom exception class used to indicate expired refresh token.
 * Extends the BaseException to provide consistent error structure across the application.
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../../ApiCodes';
import { BaseException } from '../../Base';

export class RefreshTokenExpiredException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.REFRESH_TOKEN_EXPIRED, details);
    }
}
