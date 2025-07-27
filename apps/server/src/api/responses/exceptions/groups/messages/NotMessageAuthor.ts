/**
 * @file NotMessageAuthor.ts
 * @description Exception thrown when a user attempts to modify or delete a message they did not author.
 * This preserves message integrity and ownership restrictions.
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../../ApiCodes';
import { BaseException } from '../../Base';

export class NotMessageAuthorException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.NOT_MESSAGE_AUTHOR, details);
    }
}
