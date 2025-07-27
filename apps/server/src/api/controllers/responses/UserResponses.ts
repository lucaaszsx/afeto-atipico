/**
 * @file UserResponses.ts
 * @description Response DTO classes for User endpoints
 * @author Lucas
 * @license MIT
 */

import { Exclude, Expose, Type } from 'class-transformer';
import { PrivateUser, PublicUser } from './models/user';

export class GetUserResponse extends PrivateUser {}
