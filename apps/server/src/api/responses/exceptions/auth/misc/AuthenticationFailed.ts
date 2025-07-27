/**
 * @file AuthenticationFailed.ts
 * @description Custom exception class used to indicate authentication failure.
 * Extends the BaseException to provide consistent error structure across the application.
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../../ApiCodes';
import { BaseException } from '../../Base';

export class AuthenticationFailedException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.AUTHENTICATION_FAILED, details);
    }
}
