/**
 * @file InvalidAccessToken.ts
 * @description Custom exception class used to indicate invalid access token.
 * Extends the BaseException to provide consistent error structure across the application.
 *
 * @author Lucas
 * @license MIT
 */

import { ApiErrorCodes } from '../../../ApiCodes';
import { BaseException } from '../../Base';

export class InvalidAccessTokenException extends BaseException {
    constructor(details?: string[]) {
        super(ApiErrorCodes.INVALID_ACCESS_TOKEN, details);
    }
}
