/**
 * @file InternalError.ts
 * @description Custom exception class used to indicate an internal server error.
 * Extends the BaseException to provide consistent error structure across the application.
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../ApiCodes';
import { BaseException } from '../Base';

export class InternalErrorException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.INTERNAL_SERVER_ERROR, details);
    }
}
