/**
 * @file UserResponses.ts
 * @description Response DTO classes for User endpoints
 * @author Lucas
 * @license MIT
 */

import { Exclude } from 'class-transformer';
import { PrivateUser } from './models/user';

export class GetUserResponse extends PrivateUser {}

export class UpdateProfileResponse extends PrivateUser {}

export class AddChildResponse extends PrivateUser {}

export class RemoveChildResponse extends PrivateUser {}