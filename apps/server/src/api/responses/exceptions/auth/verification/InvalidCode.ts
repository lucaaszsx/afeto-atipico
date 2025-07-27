/**
 * @file InvalidCode.ts
 * @description Custom exception class used to indicate that the provided code is invalid or malformed.
 * This exception is thrown when a verification code, access code, or similar identifier
 * does not match the expected format or validation criteria.
 * Extends the BaseException to provide consistent error structure across the application.
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../../ApiCodes';
import { BaseException } from '../../Base';

export class InvalidCodeException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.INVALID_CODE, details);
    }
}
