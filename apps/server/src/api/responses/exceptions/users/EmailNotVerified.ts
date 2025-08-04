/**
 * @file EmailNotVerified.ts
 * @description Custom exception class used to indicate that email verification is required.
 * Extends the BaseException to provide consistent error structure across the application.
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../ApiCodes';
import { BaseException } from '../Base';

export class EmailNotVerifiedException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.EMAIL_NOT_VERIFIED, details);
    }
}
