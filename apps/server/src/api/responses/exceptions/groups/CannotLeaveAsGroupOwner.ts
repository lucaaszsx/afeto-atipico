/**
 * @file CannotLeaveAsGroupOwner.ts
 * @description Exception thrown when a group owner tries to leave the group without transferring ownership.
 * This restriction ensures the group is not left without an administrator.
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../ApiCodes';
import { BaseException } from '../Base';

export class CannotLeaveAsGroupOwnerException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.CANNOT_LEAVE_AS_GROUP_OWNER, details);
    }
}