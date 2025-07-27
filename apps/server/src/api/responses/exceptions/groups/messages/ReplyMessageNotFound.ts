/**
 * @file ReplyMessageNotFound.ts
 * @description Exception thrown when a user tries to reply to a message that does not exist.
 * Usually indicates an invalid reply-to reference.
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../../ApiCodes';
import { BaseException } from '../../Base';

export class ReplyMessageNotFoundException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.REPLY_MESSAGE_NOT_FOUND, details);
    }
}
