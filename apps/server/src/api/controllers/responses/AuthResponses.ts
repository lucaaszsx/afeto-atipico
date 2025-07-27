/**
 * @file AuthResponses.ts
 * @description Response DTO classes for Auth endpoints
 * @author Lucas
 * @license MIT
 */

import { Exclude, Expose, Type } from 'class-transformer';
import { PrivateUser, PublicUser } from './models/user';

export class RegisterUserResponse extends PrivateUser {}

@Exclude()
export class LoginUserResponse {
    @Type(() => PrivateUser)
    @Expose()
    user: PrivateUser;

    @Expose()
    accessToken: string;
}

export class VerifyEmailResponse extends PrivateUser {}

@Exclude()
export class RefreshResponse {
    @Expose()
    accessToken: string;
}
