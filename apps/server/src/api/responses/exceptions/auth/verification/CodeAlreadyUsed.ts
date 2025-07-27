/**
 * @file CodeAlreadyUsed.ts
 * @description Custom exception class used to indicate that a code has already been consumed.
 * This exception is thrown when attempting to use a one-time verification code,
 * redemption code, or similar single-use identifier that has already been utilized.
 * Extends the BaseException to provide consistent error structure across the application.
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../../ApiCodes';
import { BaseException } from '../../Base';

export class CodeAlreadyUsedException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.CODE_ALREADY_USED, details);
    }
}
