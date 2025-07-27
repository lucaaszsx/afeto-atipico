/**
 * @file NotGroupOwner.ts
 * @description Exception thrown when a user attempts to perform an action restricted to group owners only,
 * such as deleting the group or managing members.
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../ApiCodes';
import { BaseException } from '../Base';

export class NotGroupOwnerException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.NOT_GROUP_OWNER, details);
    }
}
