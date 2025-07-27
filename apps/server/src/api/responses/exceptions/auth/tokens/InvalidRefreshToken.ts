/**
 * @file InvalidRefreshToken.ts
 * @description Custom exception class used to indicate invalid refresh token.
 * Extends the BaseException to provide consistent error structure across the application.
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../../ApiCodes';
import { BaseException } from '../../Base';

export class InvalidRefreshTokenException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.INVALID_REFRESH_TOKEN, details);
    }
}
