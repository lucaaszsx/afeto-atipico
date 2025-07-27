/**
 * @file CannotRemoveOwner.ts
 * @description Exception thrown when a user attempts to remove the owner of a group.
 * Only ownership transfer is allowed before the owner can be removed.
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../../ApiCodes';
import { BaseException } from '../../Base';

export class CannotRemoveOwnerException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.CANNOT_REMOVE_OWNER, details);
    }
}
