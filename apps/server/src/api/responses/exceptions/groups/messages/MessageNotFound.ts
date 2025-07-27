/**
 * @file MessageNotFound.ts
 * @description Exception thrown when a message is not found by its identifier.
 * Can occur when attempting to edit, delete, or reply to a message that doesn't exist.
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../../ApiCodes';
import { BaseException } from '../../Base';

export class MessageNotFoundException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.MESSAGE_NOT_FOUND, details);
    }
}
