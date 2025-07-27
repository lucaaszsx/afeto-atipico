/**
 * @file NotGroupMember.ts
 * @description Exception thrown when a user tries to perform actions that require group membership,
 * such as sending messages or accessing member-only content.
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../../ApiCodes';
import { BaseException } from '../../Base';

export class NotGroupMemberException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.NOT_GROUP_MEMBER, details);
    }
}
