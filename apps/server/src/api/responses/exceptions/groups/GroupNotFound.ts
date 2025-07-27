/**
 * @file GroupNotFound.ts
 * @description Exception thrown when a requested group cannot be found in the database.
 * This usually indicates an invalid or deleted group reference by ID or slug.
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../ApiCodes';
import { BaseException } from '../Base';

export class GroupNotFoundException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.GROUP_NOT_FOUND, details);
    }
}
