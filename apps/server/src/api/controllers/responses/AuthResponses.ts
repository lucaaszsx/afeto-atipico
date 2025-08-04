/**
 * @file AuthResponses.ts
 * @description Response DTO classes for Auth endpoints
 * @author Lucas
 * @license MIT
 */

import { Exclude, Expose, Type } from 'class-transformer';
import { PrivateUser, PublicUser } from './models/user';

@Exclude()
export class RegisterUserResponse {
    @Type(() => PrivateUser)
    @Expose()
    user!: PrivateUser;

    @Expose()
    accessToken!: string;
}

@Exclude()
export class LoginUserResponse {
    @Type(() => PrivateUser)
    @Expose()
    user!: PrivateUser;

    @Expose()
    accessToken!: string;
}

@Exclude()
export class RefreshResponse {
    @Expose()
    accessToken!: string;
}