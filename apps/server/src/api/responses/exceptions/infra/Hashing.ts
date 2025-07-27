/**
 * @file HashingException.ts
 * @description Custom exception class used to indicate a hashing operation failure.
 * Extends the BaseException to provide consistent error structure across the application.
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../ApiCodes';
import { BaseException } from '../Base';

export class HashingException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.HASHING_ERROR, details);
    }
}
