/**
 * @file NotFound.ts
 * @description Custom exception class used to indicate that a requested route was not found.
 * Extends the BaseException to provide consistent error structure across the application.
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../ApiCodes';
import { BaseException } from '../Base';

export class NotFoundException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.NOT_FOUND, details);
    }
}
