/**
 * @file EmailCannotBeSent.ts
 * @description Custom exception class used to indicate an email sending failure.
 * Extends the BaseException to provide consistent error structure across the application.
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../ApiCodes';
import { BaseException } from '../Base';

export class EmailCannotBeSentException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.EMAIL_CANNOT_BE_SENT, details);
    }
}
