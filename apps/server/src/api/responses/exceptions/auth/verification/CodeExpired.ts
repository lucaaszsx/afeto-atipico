/**
 * @file CodeExpired.ts
 * @description Custom exception class used to indicate that a code has exceeded its validity period.
 * This exception is thrown when a verification code, access code, or temporary token
 * has passed its expiration time and is no longer valid for use.
 * Extends the BaseException to provide consistent error structure across the application.
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../../ApiCodes';
import { BaseException } from '../../Base';

export class CodeExpiredException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.CODE_EXPIRED, details);
    }
}
