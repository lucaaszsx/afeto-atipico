/**
 * @file GroupAlreadyExists.ts
 * @description Exception thrown when a user attempts to create a group that already exists,
 * based on a unique constraint (usually name + owner combination).
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../ApiCodes';
import { BaseException } from '../Base';

export class GroupAlreadyExistsException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.GROUP_ALREADY_EXISTS, details);
    }
}
