/**
 * @file RefreshTokenMissing.ts
 * @description Custom exception class used to indicate missing refresh token.
 * Extends the BaseException to provide consistent error structure across the application.
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../../ApiCodes';
import { BaseException } from '../../Base';

export class RefreshTokenMissingException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.REFRESH_TOKEN_MISSING, details);
    }
}
