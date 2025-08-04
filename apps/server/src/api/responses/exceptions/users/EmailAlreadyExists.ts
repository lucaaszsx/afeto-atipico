/**
 * @file EmailAlreadyExists.ts
 * @description Custom exception class used to indicate that the provided email is already in use.
 * Extends the BaseException to maintain consistent error structure across the application.
 * 
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../ApiCodes';
import { BaseException } from '../Base';

export class EmailAlreadyExistsException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.EMAIL_ALREADY_EXISTS, details);
    }
}