/**
 * @file CodeMissing.ts
 * @description Custom exception class used to indicate that a required code parameter is missing.
 * This exception is thrown when an operation requires a verification code, access code,
 * or similar identifier but none was provided in the request.
 * Extends the BaseException to provide consistent error structure across the application.
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../../ApiCodes';
import { BaseException } from '../../Base';

export class CodeMissingException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.CODE_MISSING, details);
    }
}
