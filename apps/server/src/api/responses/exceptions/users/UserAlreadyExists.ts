/**
 * @file UserAlreadyExists.ts
 * @description Exception thrown when attempting to register or create a user that already exists.
 * Commonly triggered by duplicate email, username or external ID constraints.
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../ApiCodes';
import { BaseException } from '../Base';

export class UserAlreadyExistsException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.USER_ALREADY_EXISTS, details);
    }
}
