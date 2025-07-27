/**
 * @file UserNotFound.ts
 * @description Exception thrown when a requested user could not be found in the system.
 * Typically used during login, lookup, or permission validation processes.
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../ApiCodes';
import { BaseException } from '../Base';

export class UserNotFoundException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.USER_NOT_FOUND, details);
    }
}
