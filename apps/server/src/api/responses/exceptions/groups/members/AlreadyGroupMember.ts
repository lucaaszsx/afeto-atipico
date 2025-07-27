/**
 * @file AlreadyGroupMember.ts
 * @description Exception thrown when a user attempts to join a group they are already a member of.
 * Prevents redundant entries and unnecessary operations.
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../../ApiCodes';
import { BaseException } from '../../Base';

export class AlreadyGroupMemberException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.ALREADY_GROUP_MEMBER, details);
    }
}
